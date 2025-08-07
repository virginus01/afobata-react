interface AddonType {
  /** Unique identifier for the user */
  id?: string;

  _id?: string;

  /** Full name of the user */
  slug?: string;

  title?: string;

  short_desc?: string;

  long_desc?: string;

  value?: number;

  tag?: string;

  available?: boolean;

  hasValue?: boolean;
}
