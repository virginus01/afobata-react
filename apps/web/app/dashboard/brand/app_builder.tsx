'use client';
import React, { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import {
  AlertCircle,
  Smartphone,
  Loader2,
  Upload,
  Download,
  RefreshCw,
  Edit,
  Save,
} from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { capitalize } from '@/app/helpers/capitalize';
import { isNull } from '@/app/helpers/isNull';
import { modHeaders } from '@/app/helpers/modHeaders';
import { FaAndroid, FaAppStore } from 'react-icons/fa';
import slugify from 'slugify';
import FormInput from '@/app/widgets/hook_form_input';

import { api_check_action_status, api_trigger_build } from '@/app/src/constants';
import { toast } from 'sonner';
import Link from 'next/link';
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Capacitor } from '@capacitor/core';
import CustomCard from '@/app/widgets/custom_card';
import { CustomButton } from '@/app/widgets/custom_button';
import CustomImage from '@/app/widgets/optimize_image';
import AppFrontendLinks from '@/dashboard/brand/app_frontend_links';
import { Brand } from '@/app/models/Brand';
import { show_error } from '@/app/helpers/show_error';

const AppBuilder = ({ user, siteInfo }: { user: UserTypes; siteInfo: BrandType }) => {
  // State for tracking build process and history
  const [isGenerating, setIsGenerating] = useState(false);
  const [buildHistory, setBuildHistory] = useState<Array<{ date: string; status: string }>>([]);
  const [isBundleIdEditable, setIsBundleIdEditable] = useState(false);
  const [buildError, setBuildError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // User data extraction with fallbacks
  const userBrand = user.brand || {};
  const brandName = userBrand?.name || siteInfo?.name || 'App';
  const initialBuildNumber = userBrand?.mobileAppsData?.buildId || 0;

  // App download links
  const iosAppLink = (userBrand?.mobileAppsData as any)?.ios?.publicUrl || '';
  const apkAppLink = (userBrand?.mobileAppsData as any)?.apk?.publicUrl || '';
  const aabAppLink = (userBrand?.mobileAppsData as any)?.aab?.publicUrl || '';

  // Default selected platform
  const [selectedPlatform, setSelectedPlatform] = useState('android');

  let toastId: any = null;

  // Form data initialization with proper defaults
  const [formData, setFormData] = useState({
    appName: brandName,
    bundleId: generateBundleId(brandName),
    primaryColor: '#F3F4F6',
    darkMode: true,
    template: 'basic',
    domain: userBrand?.domain,
    icon: userBrand?.icon?.publicUrl,
    logo: userBrand?.logo?.publicUrl,
    buildNumber: initialBuildNumber + 1,
    version: '1.0.0',
    branchId: '',
  });

  useEffect(() => {
    const interval = setInterval(async () => {
      if (isNull(formData?.branchId)) return;

      const url = await api_check_action_status({
        subBase: siteInfo.slug,
        branchId: formData?.branchId,
      });
      const res = await fetch(url, {
        method: 'GET',
        headers: await modHeaders('get'),
      });
      const json = await res.json();

      if (json.status && json.data.status !== 'in_progress') {
        toast.dismiss(toastId as any);
        clearInterval(interval);

        // do something with json.data.conclusion or json.data.runUrl
      }
    }, 20000);

    return () => clearInterval(interval);
  }, [formData?.branchId]);

  /**
   * Generates a valid bundle ID from the given name
   * @param name - The app name to convert to bundle ID
   * @returns A valid bundle ID string
   */
  function generateBundleId(name: string): string {
    if (!name || typeof name !== 'string') {
      return 'com.defaultapp.app';
    }

    // Extract only alphabetic characters from name
    const sanitizedName = name.replace(/[^a-zA-Z]/g, '').toLowerCase();

    // Ensure we have at least some characters
    if (!sanitizedName || sanitizedName.length === 0) {
      return 'com.defaultapp.app';
    }

    // Ensure the bundleId doesn't exceed reasonable length
    const truncatedName = sanitizedName.substring(0, 20);

    return `com.${truncatedName}.app`;
  }

  /**
   * Validates if a bundle ID follows the required patterns and rules
   * @param bundleId - The bundle ID to validate
   * @returns Boolean indicating if bundle ID is valid
   */
  function isValidBundleId(bundleId: string): boolean {
    if (!bundleId || typeof bundleId !== 'string') {
      return false;
    }

    // Valid bundle ID pattern
    const pattern = /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*)+$/i;

    if (!pattern.test(bundleId)) {
      return false;
    }

    // Additional validations
    const segments = bundleId.split('.');

    // Check that we have at least 3 segments (typically com.companyname.appname)
    if (segments.length < 3) {
      return false;
    }

    // Check for reserved or system names
    const reservedNames = ['com.apple', 'com.google', 'android', 'java', 'javax'];
    if (reservedNames.some((reserved) => bundleId.startsWith(reserved + '.'))) {
      return false;
    }

    // Check segment length - prevent unreasonably short or long segments
    if (segments.some((segment) => segment.length < 2 || segment.length > 30)) {
      return false;
    }

    return true;
  }

  /**
   * Updates the app name in the form and recalculates bundle ID if needed
   * @param newName - The new app name
   */
  const updateAppName = (newName: string) => {
    setFormData((prev) => ({
      ...prev,
      appName: newName,
      // Only auto-update bundle ID if it hasn't been manually edited
      bundleId: !isBundleIdEditable ? generateBundleId(newName) : prev.bundleId,
    }));
  };

  /**
   * Toggles the edit mode for bundle ID
   */
  const toggleBundleIdEdit = () => {
    setIsBundleIdEditable(!isBundleIdEditable);
  };

  /**
   * Updates the bundle ID directly
   * @param newBundleId - The new bundle ID value
   */
  const updateBundleId = (newBundleId: string) => {
    setFormData((prev) => ({
      ...prev,
      bundleId: newBundleId,
    }));
  };

  /**
   * Handles form submission to build the app
   */
  const handleSubmit = async () => {
    //if (e) e.preventDefault();
    setBuildError(null);

    // Validate bundle ID
    if (!isValidBundleId(formData.bundleId)) {
      toast.error('Invalid bundle ID format. Please check and try again.');
      setBuildError(
        'Invalid bundle ID format. Bundle ID must follow reverse domain notation (e.g., com.company.app)',
      );
      return;
    }

    setIsGenerating(true);

    try {
      // Prepare build data
      const buildData = {
        ...userBrand,
        mobileConfig: {
          ...formData,
          platform: selectedPlatform,
          timestamp: new Date().toISOString(),
        },
      };

      // Get build API URL
      const url = await api_trigger_build({ subBase: siteInfo.slug });

      // Send build request
      const response = await fetch(url, {
        method: 'POST',
        headers: await modHeaders('post'),
        body: JSON.stringify(buildData),
      });

      if (!response.ok) {
        console.error(response.statusText);
        toast.error(response.statusText);
        return;
      }

      const { data, msg, status } = await response.json();

      if (status) {
        toast.success('Build process started successfully!');
        setSuccessMsg(msg);
        // Update build history
        setBuildHistory((prev) => [
          { date: new Date().toLocaleDateString(), status: 'Success' },
          ...prev.slice(0, 9), // Keep last 10 builds
        ]);

        // Increment build number for next build
        setFormData((prev) => ({
          ...prev,
          buildNumber: prev.buildNumber + 1,
          ...data,
        }));
      } else {
        toast.error(msg || 'Build process failed');
        setBuildError(msg || data || 'Failed to start build process');

        // Update build history with failure
        setBuildHistory((prev) => [
          { date: new Date().toLocaleDateString(), status: 'Failed' },
          ...prev.slice(0, 9),
        ]);
      }
    } catch (error) {
      const errorMsg = 'Error starting build process';
      show_error(errorMsg, error);
      toast.error(errorMsg);
      setBuildError(`${errorMsg}: ${error instanceof Error ? error.message : 'Unknown error'}`);

      // Update build history with error
      setBuildHistory((prev) => [
        { date: new Date().toLocaleDateString(), status: 'Error' },
        ...prev.slice(0, 9),
      ]);
    } finally {
      setIsGenerating(false);
    }
  };

  /**
   * Download app files with proper error handling and progress feedback
   * @param fileUrl - URL of the file to download
   * @param fileName - Suggested filename
   */
  const downloadFile = async (fileUrl: string, fileName: string) => {
    if (!fileUrl) {
      toast.error('Download link is not available.');
      return;
    }

    toast.info(`Starting download for ${fileName}...`);

    try {
      if (Capacitor.isNativePlatform() && Capacitor.getPlatform() === 'android') {
        try {
          // Show download progress toast
          const progressToast = toast.loading('Downloading file...');

          const response = await fetch(fileUrl);
          if (!response.ok) {
            throw new Error(`Failed to fetch file: ${response.status}`);
          }

          const blob = await response.blob();
          const reader = new FileReader();

          reader.onloadend = async () => {
            const base64Data = reader.result?.toString().split(',')[1];
            if (base64Data) {
              // Update progress
              toast.loading('Saving file...', { id: progressToast });

              await Filesystem.writeFile({
                path: `Download/${fileName}`,
                data: base64Data,
                directory: Directory.Documents,
                encoding: Encoding.UTF8,
              });

              toast.success(`${fileName} has been saved to the Downloads folder.`, {
                id: progressToast,
              });
            }
          };

          reader.onerror = () => {
            toast.error(`Failed to process ${fileName}`, { id: progressToast });
          };

          reader.readAsDataURL(blob);
        } catch (error: any) {
          console.error('Error saving file via native API:', error);
          toast.error('Native download failed. Trying browser download...');

          // Fallback to browser download
          const link = document.createElement('a');
          link.href = fileUrl;
          link.download = fileName;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }
      } else {
        // Web download
        const link = document.createElement('a');
        link.href = fileUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        toast.success(`${fileName} download started.`);
      }
    } catch (error) {
      console.error('Download error:', error);
      toast.error(`Failed to download ${fileName}. Please try again later.`);
    }
  };

  /**
   * Effect to handle periodic cache clearing
   */
  useEffect(() => {
    // More useful implementation of cache clearing
    const clearCache = async (cacheName: string) => {
      try {
        if ('caches' in window) {
          const cache = await caches.open(cacheName);
          if (cache) {
            await cache.delete(`/api/user/${user?.brand?.name}`);
          }
        }
      } catch (e) {
        console.warn('Cache clearing failed:', e);
      }
    };

    const intervalId = setInterval(() => {
      clearCache('user');
    }, 60000); // Every minute instead of every 600ms

    return () => clearInterval(intervalId);
  }, [user, initialBuildNumber]);

  return (
    <div className="w-full p-2 flex flex-col sm:flex-row gap-4 text-xs">
      <div className="w-full sm:w-2/3">
        <CustomCard title={`Build iOS and Android apps for ${siteInfo.name}`}>
          {buildError && (
            <Alert variant="destructive" className="mb-4 text-xs">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Build Error</AlertTitle>
              <AlertDescription className="text-xs">{buildError}</AlertDescription>
            </Alert>
          )}

          {successMsg && (
            <Alert variant="default" className="mb-4 text-green-700 text-xs">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-xs">{successMsg}</AlertDescription>
            </Alert>
          )}

          <Tabs defaultValue="basic" className="mb-8">
            <TabsList className="grid w-full grid-cols-3 gap-4">
              <TabsTrigger value="basic" className="flex items-center gap-2 text-xs">
                <Smartphone className="w-3 h-3" /> Basic Info
              </TabsTrigger>

              <TabsTrigger value="advanced" className="flex items-center gap-2 text-xs">
                <RefreshCw className="w-3 h-3" /> Advanced
              </TabsTrigger>

              <TabsTrigger value="download" className="flex items-center gap-2 text-xs">
                <Download className="w-3 h-3" /> Download
              </TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4 py-10">
              <div className="space-y-4">
                <div>
                  <FormInput
                    controlled={false}
                    label="App Name"
                    name="appName"
                    placeholder="Enter app name"
                    value={formData.appName}
                    onChange={() => {}}
                    onBlur={(e) => {
                      updateAppName(e.target.value);
                    }}
                  />
                </div>

                <div className="relative">
                  <FormInput
                    disabled={!isBundleIdEditable}
                    controlled={false}
                    id="bundleId"
                    placeholder="com.example.app"
                    value={formData.bundleId}
                    onChange={(e) => updateBundleId(e.target.value)}
                    label={'Bundle ID'}
                    name="bundleId"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-2 top-8"
                    onClick={toggleBundleIdEdit}
                  >
                    {isBundleIdEditable ? (
                      <Save className="h-4 w-4" />
                    ) : (
                      <Edit className="h-4 w-4" />
                    )}
                  </Button>
                  {!isValidBundleId(formData.bundleId) && formData.bundleId.length > 0 && (
                    <p className="text-red-500 text-xs mt-1">
                      Bundle ID must follow reverse domain notation (e.g., com.company.app)
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="icon" className="my-2 text-xs">
                    App Icon
                  </Label>
                  <div className="flex items-center gap-4">
                    <CustomImage imgFile={siteInfo.icon} height={80} width={80} />
                    <div>
                      <p className="text-xs text-muted-foreground mb-2">
                        Your brand icon will be used as the app icon.
                      </p>
                      {/* Could add an upload option here */}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="primaryColor">Brand Color</Label>
                  <div className="flex items-center gap-4">
                    <input
                      type="color"
                      id="primaryColor"
                      value={formData.primaryColor}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, primaryColor: e.target.value }))
                      }
                      className="h-10 w-10 border rounded cursor-pointer"
                    />
                    <span className="text-xs">{formData.primaryColor}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Switch
                    id="darkMode"
                    checked={formData.darkMode}
                    onCheckedChange={(checked) =>
                      setFormData((prev) => ({ ...prev, darkMode: checked }))
                    }
                  />
                  <Label htmlFor="darkMode">Support Dark Mode</Label>
                </div>
              </div>
            </TabsContent>

            {/* New Advanced Tab */}
            <TabsContent value="advanced" className="space-y-4 py-10">
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <FormInput
                      controlled={false}
                      label="Version"
                      id="version"
                      name="version"
                      placeholder="1.0.0"
                      value={formData.version}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, version: e.target.value }))
                      }
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Semantic versioning (e.g., 1.0.0)
                    </p>
                  </div>
                  <div>
                    <FormInput
                      controlled={false}
                      label="Build Number"
                      id="buildNumber"
                      name="buildNumber"
                      type="number"
                      min={1}
                      placeholder="1"
                      value={formData.buildNumber.toString()}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          buildNumber: parseInt(e.target.value) || 1,
                        }))
                      }
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Incremental number for each build
                    </p>
                  </div>
                </div>

                {buildHistory.length > 0 && (
                  <div className="mt-4">
                    <h3 className="text-xs font-medium mb-2">Recent Build History</h3>
                    <div className="border rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-xs font-medium text-gray-500">Date</th>
                            <th className="px-4 py-2 text-xs font-medium text-gray-500">Status</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {buildHistory.map((build, index) => (
                            <tr key={index}>
                              <td className="px-4 py-2 text-xs">{build.date}</td>
                              <td className="px-4 py-2 text-xs">
                                <span
                                  className={`inline-block rounded-full px-2 py-1 text-xs ${
                                    build.status === 'Success'
                                      ? 'bg-green-100 text-green-800'
                                      : 'bg-red-100 text-red-800'
                                  }`}
                                >
                                  {build.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Download Section */}
            <TabsContent value="download" className="flex flex-col space-y-8 py-10">
              <div className="space-y-4">
                <Label className="text-xs font-bold">Download Built Apps</Label>
                <AppDownloadSection
                  iosAppLink={iosAppLink}
                  aabAppLink={aabAppLink}
                  apkAppLink={apkAppLink}
                  downloadFile={downloadFile}
                />
              </div>

              <div className="space-y-4">
                <Label className="text-xs font-bold">Download Page Links</Label>

                <p>Add the links that will enable users download your app</p>

                <AppFrontendLinks
                  siteInfo={siteInfo as Brand}
                  brand={user.brand as Brand}
                  iosAppLink={iosAppLink}
                  apkAppLink={apkAppLink}
                />
              </div>
            </TabsContent>
          </Tabs>
        </CustomCard>
      </div>
      <div className="w-full sm:w-1/3">
        <div className="space-y-4">
          <CustomCard title="App Builder Action">
            <div className="flex flex-col space-y-5">
              {' '}
              <div className="grid grid-cols-2 gap-4">
                <Button
                  type="button"
                  variant={selectedPlatform === 'ios' ? 'default' : 'outline'}
                  className="h-28 relative"
                  onClick={() => setSelectedPlatform('ios')}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative w-10 h-10 flex items-center justify-center">
                      <FaAppStore className="w-6 h-6" />
                    </div>
                    <span className="text-xs">iOS Only</span>
                  </div>
                </Button>
                <Button
                  type="button"
                  variant={selectedPlatform === 'android' ? 'default' : 'outline'}
                  className="h-28 relative"
                  onClick={() => setSelectedPlatform('android')}
                >
                  <div className="flex flex-col items-center gap-3">
                    <div className="relative w-10 h-10 flex items-center justify-center">
                      <FaAndroid className="w-6 h-6" />
                    </div>
                    <span className="text-xs">Android Only</span>
                  </div>
                </Button>
                {/* <Button
                    type="button"
                    variant={selectedPlatform === "both" ? "default" : "outline"}
                    className="h-28 relative"
                    onClick={() => setSelectedPlatform("both")}
                  >
                    <div className="flex flex-col items-center gap-3">
                      <div className="relative w-12 h-10 flex items-center justify-center">
                        <FaAppStore className="w-6 h-6 absolute left-0" />
                        <FaAndroid className="w-6 h-6 absolute right-0" />
                      </div>
                      <span className="text-xs">Both Platforms</span>
                    </div>
                  </Button> */}
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="font-medium">Platform:</span>
                  <span>
                    {selectedPlatform === 'both' ? 'iOS & Android' : capitalize(selectedPlatform)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Bundle ID:</span>
                  <span className="text-xs truncate">{formData.bundleId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Version:</span>
                  <span>{formData.version}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Build #:</span>
                  <span>{formData.buildNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="font-medium">Dark Mode:</span>
                  <span>{formData.darkMode ? 'Enabled' : 'Disabled'}</span>
                </div>
              </div>
              <CustomButton
                submitting={isGenerating}
                submittingText="Building App..."
                onClick={() => handleSubmit()}
                disabled={!isValidBundleId(formData.bundleId)}
              >
                Build {capitalize(formData.appName || '')} Apps
              </CustomButton>
            </div>
          </CustomCard>
        </div>
      </div>
    </div>
  );
};

interface DownloadProps {
  iosAppLink?: string;
  aabAppLink?: string;
  apkAppLink?: string;
  downloadFile: (url: string, fileName: string) => Promise<void>;
}

const AppDownloadSection: React.FC<DownloadProps> = ({
  iosAppLink,
  aabAppLink,
  apkAppLink,
  downloadFile,
}) => {
  const hasDownloads = iosAppLink || aabAppLink || apkAppLink;

  return (
    <div>
      {!hasDownloads && (
        <Alert className="mb-4 text-xs">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle className="text-xs">No downloads available</AlertTitle>
          <AlertDescription className="text-xs">
            Build your app first to generate download links for the applications.
          </AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* iOS App Download */}
        <Button
          variant="outline"
          className="h-28 flex flex-col items-center justify-center gap-2"
          disabled={!iosAppLink}
          onClick={() => downloadFile(iosAppLink || '', 'app.ipa')}
        >
          <FaAppStore className="w-8 h-8" />
          <span className="text-xs">Download .ipa (iOS)</span>
          {!iosAppLink && <span className="text-xs text-muted-foreground">Not available</span>}
        </Button>

        {/* Android Play Store (AAB) Download */}
        <Button
          variant="outline"
          className="h-28 flex flex-col items-center justify-center gap-2"
          disabled={!aabAppLink}
          onClick={() => downloadFile(aabAppLink || '', 'app.aab')}
        >
          <FaAndroid className="w-8 h-8" />
          <span className="text-xs">Download .aab (PlayStore)</span>
          {!aabAppLink && <span className="text-xs text-muted-foreground">Not available</span>}
        </Button>

        {/* Android APK Download */}
        <Button
          variant="outline"
          className="h-28 flex flex-col items-center justify-center gap-2"
          disabled={!apkAppLink}
          onClick={() => downloadFile(apkAppLink || '', 'app.apk')}
        >
          <FaAndroid className="w-8 h-8" />
          <span className="text-xs">Download .apk (Android)</span>
          {!apkAppLink && <span className="text-xs text-muted-foreground">Not available</span>}
        </Button>
      </div>
    </div>
  );
};

export { AppBuilder };
