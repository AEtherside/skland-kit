interface ImportMetaEnv {
  VITE_SKLAND_TOKEN?: string
  VITE_SKLAND_UID?: string
  /// ↓ for endfield test

  VITE_SKLAND_ROLE_ID?: string
  VITE_SKLAND_SERVER_ID?: string
}

interface ImportMeta {
  env: ImportMetaEnv
}
