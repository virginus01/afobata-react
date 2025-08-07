declare module 'konsta/config' {
    import { Config } from 'tailwindcss'
    
    function konstaConfig(config: Config): Config
    export = konstaConfig
  }