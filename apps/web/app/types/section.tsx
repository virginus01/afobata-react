import { StyleProperties } from '@/app/types/tailwindcss';

export interface BrandPreference {
  default: Preferences[];
  creator?: Preferences[];
  utility?: Preferences[];
}

export interface Preferences {
  type: string;
  key: string;
  value?: string | Preferences[][] | any;
  data?: any;
  title?: string;
  others?: { tag: string; value: string }[];
}

export interface SortableSectionProps {
  section: ViewRenderData;
  allSections?: any[];
  rows?: ViewRenderData[];
  addRowToSection?: (id: string) => void;
  availableSections: SectionOption[];
  onRemove: (id: string) => void;
  onEdit: (id: string) => void;
  user: UserTypes;
  siteInfo: BrandType;
}

export interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (section: SectionOption) => void;
  sections: SectionOption[];
  title?: string;
  user: UserTypes;
  siteInfo: BrandType;
}

export interface SidebarProps {
  title: string;
  sections: ViewRenderData[];
  onRemove: (id: string) => void;
  onEdit: (id: string) => void;
  onAddSection: () => void;
  allSections?: any[];
  rows?: ViewRenderData[];
  addRowToSection?: (id: string) => void;
  availableSections: SectionOption[];
  user: UserTypes;
  siteInfo: BrandType;
}

export interface SectionOption {
  type: string;
  key: keyof ComponentMap;
  label: string;
  config?: any;
  classes?: StyleProperties | any;
  sectionClasses?: StyleProperties;
  data?: string;
  thumbnail?: string;
  essentials?: string[];
  preferences?: BrandPreference;
}
