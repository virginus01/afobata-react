// types/konsta.d.ts
declare module 'konsta/config' {
    import { Config } from 'postcss-load-config';
    
    export default function konstaConfig(config: Config): Config;
  }