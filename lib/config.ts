export interface AppConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  supabaseServiceKey: string;
  anthropicApiKey: string;
  deepgramApiKey: string;
  twilioAccountSid: string;
  twilioAuthToken: string;
  twilioWhatsappNumber: string;
  cronSecret: string;
  nodeEnv: string;
}

function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) throw new Error(`Missing required environment variable: ${key}`);
  return value;
}

function optionalEnv(key: string, fallback = ""): string {
  return process.env[key] ?? fallback;
}

export function getConfig(): AppConfig {
  return {
    supabaseUrl: requireEnv("NEXT_PUBLIC_SUPABASE_URL"),
    supabaseAnonKey: requireEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY"),
    supabaseServiceKey: requireEnv("SUPABASE_SERVICE_ROLE_KEY"),
    anthropicApiKey: requireEnv("ANTHROPIC_API_KEY"),
    deepgramApiKey: requireEnv("DEEPGRAM_API_KEY"),
    twilioAccountSid: requireEnv("TWILIO_ACCOUNT_SID"),
    twilioAuthToken: requireEnv("TWILIO_AUTH_TOKEN"),
    twilioWhatsappNumber: optionalEnv(
      "TWILIO_WHATSAPP_NUMBER",
      "whatsapp:+14155238886"
    ),
    cronSecret: optionalEnv("CRON_SECRET"),
    nodeEnv: optionalEnv("NODE_ENV", "development"),
  };
}

export function getConfigSafe(): Partial<AppConfig> {
  try {
    return getConfig();
  } catch {
    return {};
  }
}

export function isFullyConfigured(): boolean {
  const required = [
    "NEXT_PUBLIC_SUPABASE_URL",
    "SUPABASE_SERVICE_ROLE_KEY",
    "ANTHROPIC_API_KEY",
    "TWILIO_ACCOUNT_SID",
    "TWILIO_AUTH_TOKEN",
  ];
  return required.every((k) => Boolean(process.env[k]));
}
