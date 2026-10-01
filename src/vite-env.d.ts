/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL?: string;
  readonly VITE_KAVENEGAR_API_KEY?: string;
  readonly VITE_KAVENEGAR_OTP_TEMPLATE?: string;
  readonly VITE_RECAPTCHA_SITE_KEY?: string;
  readonly VITE_PUSHER_KEY?: string;
  readonly VITE_PUSHER_CLUSTER?: string;
  readonly VITE_FIREBASE_API_KEY?: string;
  readonly VITE_FIREBASE_PROJECT_ID?: string;
  readonly VITE_FIREBASE_MESSAGING_SENDER_ID?: string;
  readonly VITE_FIREBASE_APP_ID?: string;
  readonly VITE_FIREBASE_VAPID_KEY?: string;
  readonly VITE_PAYMENT_GATEWAY?: string;
  readonly VITE_PAYMENT_MERCHANT_ID?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
