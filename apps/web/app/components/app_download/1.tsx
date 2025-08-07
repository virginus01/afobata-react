"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Smartphone, Share, Plus, Chrome, Download, X } from "lucide-react";
import { Brand } from "@/app/models/Brand";
import { route_public_page } from "@/app/routes/page_routes";

// PWA Installation Guide Component
const PWAInstallGuide = ({
  isVisible,
  onClose,
  siteInfo,
}: {
  isVisible: boolean;
  onClose: () => void;
  siteInfo: any;
}) => {
  const [platform, setPlatform] = useState("unknown");
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);

  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform("ios");
    } else if (/android/.test(userAgent)) {
      setPlatform("android");
    } else if (/chrome/.test(userAgent) && !/edge/.test(userAgent)) {
      setPlatform("desktop-chrome");
    } else {
      setPlatform("desktop-other");
    }

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt?.prompt();
      const { outcome } = await deferredPrompt?.userChoice;
      if (outcome === "accepted") {
        setDeferredPrompt(null);
        setIsInstallable(false);
        onClose();
      }
    }
  };

  const IOSInstructions = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
          <span className="text-white font-bold ">S</span>
        </div>
        <h3 className="text-xl font-semibold text-gray-800">Install on iPhone/iPad</h3>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4">
        <p className="text-amber-800 ">
          <strong>Note:</strong> PWA installation is only supported in Safari and Chrome on iOS
          devices.
        </p>
      </div>

      <div className="space-y-4">
        <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold ">
            1
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Open Safari or Chrome Browser</h4>
            <p className="text-gray-600 ">
              {
                "Make sure you're using Safari or Chrome as PWA installation is only supported in Safari or Chrome on iOS."
              }
            </p>
          </div>
        </div>

        <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold ">
            2
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Tap the Share Button</h4>
            <div className="flex items-center gap-2 mb-2">
              <Share className="w-5 h-5 text-blue-500" />
              <span className=" text-gray-600">
                Look for this icon at the bottom of Safari or top of Chrome
              </span>
            </div>
            <p className="text-gray-600 ">
              {
                " Tap the share button in Safari's toolbar (square with arrow pointing up) or Chrome's address bar."
              }
            </p>
          </div>
        </div>

        <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold ">
            3
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">{'Find "Add to Home Screen"'}</h4>
            <div className="flex items-center gap-2 mb-2">
              <Plus className="w-5 h-5 text-green-500" />
              <span className=" text-gray-600">Scroll down to find this option</span>
            </div>
            <p className="text-gray-600 ">
              {`In the share menu, scroll down and tap "Add to Home Screen".`}
            </p>
          </div>
        </div>

        <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold ">
            4
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Customize and Add</h4>
            <p className="text-gray-600 ">
              {` You can customize the app name, then tap "Add" in the top right corner. The app will
              now appear on your home screen!`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const AndroidInstructions = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Chrome className="w-8 h-8 text-green-500" />
        <h3 className="text-xl font-semibold text-gray-800">Install on Android</h3>
      </div>

      {isInstallable && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <p className="text-green-800 ">
              <strong>Great news!</strong> This app can be installed directly.
            </p>
            <button
              onClick={handleInstallClick}
              className="bg-green-500 text-white px-4 py-2 rounded-lg  font-medium hover:bg-green-600 transition-colors"
            >
              Install Now
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold ">
            1
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Open Chrome Browser</h4>
            <p className="text-gray-600 ">
              Navigate to this website using Chrome browser for the best PWA experience.
            </p>
          </div>
        </div>

        <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold ">
            2
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Look for Install Banner</h4>
            <p className="text-gray-600 ">
              {` Chrome may show an "Add to Home Screen" banner at the bottom. If you see it, tap "Add"
              or "Install".`}
            </p>
          </div>
        </div>

        <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold ">
            3
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Use Menu Option</h4>
            <p className="text-gray-600  mb-2">If no banner appears:</p>
            <ul className=" text-gray-600 space-y-1 ml-4">
              <li>• Tap the three dots menu (⋮) in Chrome</li>
              <li>•{` Select "Add to Home Screen" or "Install App"`}</li>
              <li>• Follow the prompts to install</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex-shrink-0 w-8 h-8 bg-green-500 text-white rounded-full flex items-center justify-center font-semibold ">
            4
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Confirm Installation</h4>
            <p className="text-gray-600 ">
              {` Tap "Add" or "Install" in the confirmation dialog. The app will be added to your home
              screen and app drawer!`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const DesktopInstructions = () => (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-4">
        <Chrome className="w-8 h-8 text-blue-500" />
        <h3 className="text-xl font-semibold text-gray-800">Install on Desktop</h3>
      </div>

      {isInstallable && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
          <div className="flex items-center justify-between">
            <p className="text-blue-800 ">
              <strong>Ready to install!</strong> This app can be installed on your desktop.
            </p>
            <button
              onClick={handleInstallClick}
              className="bg-blue-500 text-white px-4 py-2 rounded-lg  font-medium hover:bg-blue-600 transition-colors"
            >
              Install Now
            </button>
          </div>
        </div>
      )}

      <div className="space-y-4">
        <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold ">
            1
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Look for Install Icon</h4>
            <div className="flex items-center gap-2 mb-2">
              <Download className="w-5 h-5 text-blue-500" />
              <span className=" text-gray-600">Install icon in the address bar</span>
            </div>
            <p className="text-gray-600 ">
              {" Check the right side of Chrome's address bar for a download/install icon."}
            </p>
          </div>
        </div>

        <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold ">
            2
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Use Chrome Menu</h4>
            <p className="text-gray-600  mb-2">
              Alternatively, click the three dots menu (⋮) in Chrome and look for:
            </p>
            <ul className=" text-gray-600 space-y-1 ml-4">
              <li>• Install {siteInfo?.name || "App"}</li>
              <li>• Add to Desktop</li>
              <li>• Create Shortcut</li>
            </ul>
          </div>
        </div>

        <div className="flex gap-4 p-4 bg-gray-50 rounded-lg">
          <div className="flex-shrink-0 w-8 h-8 bg-blue-500 text-white rounded-full flex items-center justify-center font-semibold ">
            3
          </div>
          <div>
            <h4 className="font-semibold text-gray-800 mb-2">Complete Installation</h4>
            <p className="text-gray-600 ">
              {
                'Click "Install" in the confirmation dialog. The app will be installed and can be launched like any desktop application!'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const getPlatformInstructions = () => {
    switch (platform) {
      case "ios":
        return <IOSInstructions />;
      case "android":
        return <AndroidInstructions />;
      case "desktop-chrome":
      case "desktop-other":
        return <DesktopInstructions />;
      default:
        return (
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Choose Your Platform</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <button
                onClick={() => setPlatform("ios")}
                className="p-4 border border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors text-left"
              >
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mb-2">
                  <span className="text-white font-bold ">S</span>
                </div>
                <h4 className="font-semibold">iOS (iPhone/iPad)</h4>
                <p className=" text-gray-600">Safari browser</p>
              </button>
              <button
                onClick={() => setPlatform("android")}
                className="p-4 border border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors text-left"
              >
                <Smartphone className="w-8 h-8 text-green-500 mb-2" />
                <h4 className="font-semibold">Android</h4>
                <p className=" text-gray-600">Chrome browser</p>
              </button>
              <button
                onClick={() => setPlatform("desktop-chrome")}
                className="p-4 border border-gray-200 rounded-lg hover:border-purple-500 hover:bg-purple-50 transition-colors text-left"
              >
                <Chrome className="w-8 h-8 text-purple-500 mb-2" />
                <h4 className="font-semibold">Desktop</h4>
                <p className=" text-gray-600">Chrome/Edge browser</p>
              </button>
            </div>
          </div>
        );
    }
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between">
          <h2 className="text-md font-bold text-gray-800">Install {siteInfo?.name || "App"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2 ">Why Install This App?</h3>
            <ul className="text-xs text-blue-700 space-y-1">
              <li>• Works offline and loads faster</li>
              <li>• Full-screen experience without browser UI</li>
              <li>• Easy access from your home screen</li>
              <li>• Automatic updates in the background</li>
              <li>• Native app-like experience</li>
            </ul>
          </div>

          {getPlatformInstructions()}

          {platform !== "unknown" && (
            <div className="mt-6 pt-4 border-t border-gray-200">
              <button
                onClick={() => setPlatform("unknown")}
                className="text-blue-500 hover:text-blue-600  font-medium"
              >
                ← Choose Different Platform
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default function AppDownloadLanding({
  siteInfo,
  user,
  auth,
  preference,
}: {
  siteInfo: Brand;
  user: UserTypes;
  auth: AuthModel;
  preference?: Record<string, any>;
}) {
  const [showPWAGuide, setShowPWAGuide] = useState(false);

  const [platform, setPlatform] = useState("unknown");

  useEffect(() => {
    // Detect platform
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod/.test(userAgent)) {
      setPlatform("ios");
    } else if (/android/.test(userAgent)) {
      setPlatform("android");
    } else if (/chrome/.test(userAgent) && !/edge/.test(userAgent)) {
      setPlatform("desktop-chrome");
    } else {
      setPlatform("desktop-other");
    }

    // Listen for PWA install prompt
    const handleBeforeInstallPrompt = (e: any) => {
      e.preventDefault();
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  // Check if download links are available
  const hasAndroidLink = Boolean(
    preference?.apkLink || siteInfo?.mobileAppsData?.androidDownloadUrl
  );
  const hasIOSLink = Boolean(preference?.iosLink || siteInfo?.mobileAppsData?.iosDownloadUrl);

  const getDownloadUrl = (platform: "android" | "ios") => {
    if (platform === "android") {
      return preference?.apkLink || siteInfo?.mobileAppsData?.androidDownloadUrl;
    }
    return preference?.iosLink || siteInfo?.mobileAppsData?.iosDownloadUrl;
  };

  const handleDownloadClick = (platform: "android" | "ios", e: React.MouseEvent) => {
    const downloadUrl = getDownloadUrl(platform);

    if (!downloadUrl) {
      e.preventDefault();
      setShowPWAGuide(true);
    }
  };

  return (
    <div className="min-h-screen">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
        <div className="flex flex-col-reverse lg:flex-row items-center justify-between gap-12 lg:gap-0 min-h-screen">
          {/* Left Content */}
          <div className="w-full lg:w-1/2 text-center lg:text-left">
            {/* New Badge */}
            <div className="inline-flex items-center bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 mb-6 shadow-md">
              <span className="bg-orange-500 text-white text-xs font-semibold px-2 py-1 rounded-full mr-2">
                New
              </span>
              <span className=" font-medium">{siteInfo.name} is live in Nigeria</span>
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </div>

            {/* Main Heading */}
            <h1 className="title font-briston text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-4">
              {preference?.theBestBill ?? "The Best Bill-Paying Platform"}
            </h1>

            {/* Underline decoration */}
            <div className="w-full h-full">
              <Image
                src="/images/stroke.svg"
                alt={siteInfo?.name ?? ""}
                width={1000}
                height={1000}
                className="w-full h-full object-contain"
              />
            </div>

            {/* Subtitle */}
            <p className="mb-8 max-w-md text-md mx-auto lg:mx-0">
              {preference?.ourplatformmakes ??
                "Our platform makes paying bills easy and hassle-free."}
            </p>

            {/* Download Buttons */}
            <div className="flex flex-row justify-center gap-4">
              {/* Google Play */}
              <a
                href={
                  hasAndroidLink
                    ? getDownloadUrl("android")
                    : route_public_page({ paths: ["app-download#androidPWA"] })
                }
                className="inline-flex items-center bg-black hover:bg-gray-900 transition duration-200 text-white px-6 py-3 rounded-2xl font-medium"
                target={hasAndroidLink ? "_blank" : undefined}
                rel={hasAndroidLink ? "nofollow noreferrer" : undefined}
                title={hasAndroidLink ? "Download on Google Play" : "Install as PWA on Android"}
                onClick={(e) => handleDownloadClick("android", e)}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs text-gray-300">
                    {hasAndroidLink ? "GET IT ON" : "INSTALL ON"}
                  </div>
                  <div className="font-semibold">{hasAndroidLink ? "Google Play" : "Android"}</div>
                </div>
              </a>

              {/* App Store */}
              <a
                href={
                  hasIOSLink
                    ? getDownloadUrl("ios")
                    : route_public_page({ paths: ["app-download#iosPWA"] })
                }
                className="inline-flex items-center bg-black hover:bg-gray-900 transition duration-200 text-white px-6 py-3 rounded-2xl font-medium"
                target={hasIOSLink ? "_blank" : undefined}
                rel={hasIOSLink ? "nofollow noreferrer" : undefined}
                title={hasIOSLink ? "Download on the App Store" : "Install as PWA on iOS"}
                onClick={(e) => handleDownloadClick("ios", e)}
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.71,19.5C17.88,20.74 17,21.95 15.66,21.97C14.32,22 13.89,21.18 12.37,21.18C10.84,21.18 10.37,21.95 9.1,22C7.79,22.05 6.8,20.68 5.96,19.47C4.25,17 2.94,12.45 4.7,9.39C5.57,7.87 7.13,6.91 8.82,6.88C10.1,6.86 11.32,7.75 12.11,7.75C12.89,7.75 14.37,6.68 15.92,6.84C16.57,6.87 18.39,7.1 19.56,8.82C19.47,8.88 17.39,10.1 17.41,12.63C17.44,15.65 20.06,16.66 20.09,16.67C20.06,16.74 19.67,18.11 18.71,19.5M13,3.5C13.73,2.67 14.94,2.04 15.94,2C16.07,3.17 15.6,4.35 14.9,5.19C14.21,6.04 13.07,6.7 11.95,6.61C11.8,5.46 12.36,4.26 13,3.5Z" />
                </svg>
                <div className="text-left">
                  <div className="text-xs text-gray-300">
                    {hasIOSLink ? "Download on the" : "INSTALL ON"}
                  </div>
                  <div className="font-semibold">{hasIOSLink ? "App Store" : "iPhone/iPad"}</div>
                </div>
              </a>
            </div>

            {/* PWA Notice */}
            {(!hasAndroidLink || !hasIOSLink) && !["android", "ios"].includes(platform) && (
              <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-start gap-3">
                  <Smartphone className="w-5 h-5 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="">
                    <p className="text-blue-800 font-medium mb-1">Install as Web App</p>
                    <p className="text-blue-700">
                      Get the full app experience by installing {siteInfo?.name} directly from your
                      browser. Works offline and feels like a native app!
                    </p>
                    <button
                      onClick={() => setShowPWAGuide(true)}
                      className="text-blue-600 hover:text-blue-800 font-medium mt-2 underline"
                    >
                      Show installation guide →
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Right Content - Phone Mockup */}
          <div className="w-full lg:w-1/2 flex justify-center">
            <div className="relative w-4/5 sm:w-3/5 md:w-1/2 lg:w-full max-w-xs">
              <Image
                src={preference?.mockup ?? `/images/app-mockup.png`}
                alt={siteInfo?.name ?? ""}
                width={288}
                height={384}
                className="w-full h-auto object-contain"
                priority
              />
            </div>
          </div>
        </div>
      </div>

      {/* PWA Installation Guide Modal */}
      <PWAInstallGuide
        isVisible={showPWAGuide}
        onClose={() => setShowPWAGuide(false)}
        siteInfo={siteInfo}
      />
    </div>
  );
}
