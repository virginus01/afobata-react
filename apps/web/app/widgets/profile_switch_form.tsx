import React from 'react';
import { useUserContext } from '@/app/contexts/user_context';

interface ProfileSelectionProps {
  title: string;
  subtitle: string;
  profiles: any[];
  selectedProfile: any;
  onSelectProfile: (selectedProfile: string) => void;
  onSubmit: (profileId?: string) => void;
  submitting: boolean;
  submitted: boolean;
}

const ProfileSelection: React.FC<ProfileSelectionProps> = ({
  title,
  subtitle,
  profiles,
  onSelectProfile,
  onSubmit,
}) => {
  const { selectedProfile } = useUserContext();

  return (
    <section className="flex flex-col items-center justify-center w-full min-h-screen sm:px-5 text-center">
      {/* Title */}
      <div className="text-sm sm:text-base md:text-lg font-medium leading-tight tracking-tight mt-6">
        {title}
      </div>

      {/* Subtitle */}
      <div className="text-xs sm:text-sm md:text-base pt-4 pb-6 sm:pb-10">{subtitle}</div>

      {/* Profile Grid */}
      <div className="grid w-full gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 px-1 sm:px-4 mb-10">
        {profiles &&
          Array.isArray(profiles) &&
          profiles.map((profile) => (
            <div
              key={profile.id}
              className={`transition-all duration-300 ease-in-out cursor-pointer rounded-md ${
                selectedProfile === profile.id
                  ? 'border brand-border-secondary text-sm hover:brand-border-primary hover:pl-1'
                  : 'border border-gray-300 text-xs  hover:brand-border-primary hover:border-1 hover:pl-1'
              }`}
              onClick={() => {
                onSelectProfile(profile.id);
                onSubmit(profile);
              }}
            >
              <div className="flex flex-col text-start">
                <p className="font-medium border-b border-gray-200 p-2">{profile.name}</p>
                <p className="p-2 line-clamp-5">{profile.shortDesc}</p>
              </div>
            </div>
          ))}
      </div>
    </section>
  );
};

export default ProfileSelection;
