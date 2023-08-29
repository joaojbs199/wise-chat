declare namespace NodeJS {
  export interface ProcessEnv {
    OPENAI_API_KEY: string;
    HOST: string;
    PORT: number;
    USER: string;
    PASSWORD: string;
    DATABASE: string;

    SUPABASE_PASSWORD: string;
    SUPABASE_API_KEY: string;
    SUPABASE_URL: string;
  }
}
