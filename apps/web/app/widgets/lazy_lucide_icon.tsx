'use client';
import React, { lazy, Suspense } from 'react';
import type { ComponentType } from 'react';

// Fallback icon component
const FallbackIcon: React.FC<{ iconName: string; size?: number }> = ({ iconName, size = 32 }) => (
  <div
    className="rounded bg-gray-300 flex items-center justify-center text-xs"
    style={{ width: size, height: size }}
    title={`Icon not found: ${iconName}`}
  >
    ❓
  </div>
);

export default function LazyLucideIcon({
  iconName,
  size = 32,
  className = '',
}: {
  iconName: unknown;
  size?: number;
  className?: string;
}) {
  // If iconName is not a string, render fallback immediately
  if (typeof iconName !== 'string' || !iconName.trim()) {
    console.warn('LazyLucideIcon: Invalid iconName:', iconName);
    return <FallbackIcon iconName="invalid" size={size} />;
  }

  const IconComponent = lazy(async () => {
    try {
      const lucideModule: any = await import('lucide-react');
      const icon = lucideModule[iconName]! ?? null;

      if (icon) {
        return { default: icon as ComponentType<any> };
      }

      console.warn(iconName, ' icon not found');

      return {
        default: () => <FallbackIcon iconName={iconName} size={size} />,
      };
    } catch (error) {
      console.error('LazyLucideIcon: Error loading lucide-react:', error);
      return {
        default: () => <FallbackIcon iconName={iconName} size={size} />,
      };
    }
  });

  return (
    <Suspense
      fallback={
        <div style={{ width: size, height: size }} className="rounded bg-gray-200 animate-pulse" />
      }
    >
      <IconComponent size={size} className={className} />
    </Suspense>
  );
}
