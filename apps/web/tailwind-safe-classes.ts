// tailwind-safe-classes.ts
export const brandClassSafelist = `
  brand-bg-primary
  brand-bg-secondary
  brand-text-primary
  brand-text-secondary
  brand-bg
  brand-text
  brand-text-card
  brand-bg-card
  dark:brand-bg-primary
  dark:brand-bg-secondary
  dark:brand-text-primary
  dark:brand-text-secondary
  dark:brand-bg
  dark:brand-text
  dark:brand-bg-card
  dark:brand-text-card
`;


export const safelistClasses = {
  'brand-bg-primary': 'hsl(var(--primary-background-light))',
  'brand-bg-secondary': 'hsl(var(--secondary-background-light))',
  'brand-text-primary': 'hsl(var(--primary-foreground))',
  'brand-text-secondary': 'hsl(var(--secondary-foreground))',
  'brand-bg': 'hsl(var(--background))',
  'brand-text': 'hsl(var(--foreground))',
  'brand-text-card': 'hsl(var(--card-foreground))',
  'brand-bg-card': 'hsl(var(--card-background))',
  'dark:brand-bg-primary': 'hsl(var(--primary-background-dark))',
  'dark:brand-bg-secondary': 'hsl(var(--secondary-background-dark))',
  'dark:brand-text-primary': 'hsl(var(--primary-foreground-dark))',
  'dark:brand-text-secondary': 'hsl(var(--secondary-foreground-dark))',
  'dark:brand-bg': 'hsl(var(--background-dark))',
  'dark:brand-text': 'hsl(var(--foreground-dark))',
  'dark:brand-bg-card': 'hsl(var(--card-background-dark))',
  'dark:brand-text-card': 'hsl(var(--card-foreground-dark))'
} ;
