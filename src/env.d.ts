/// <reference types="@anthropic-ng/env" />

// Type definitions for environment variables
// These are loaded from .env file via @ngx-env/builder

interface ImportMetaEnv {
    // Admin credentials
    readonly NG_APP_ADMIN_EMAIL: string;
    readonly NG_APP_ADMIN_PASSWORD: string;

    // Shop credentials
    readonly NG_APP_SHOP_EMAIL: string;
    readonly NG_APP_SHOP_PASSWORD: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
