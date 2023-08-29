import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { SupabaseVectorStore } from 'langchain/vectorstores/supabase';
import { createClient } from '@supabase/supabase-js';

export const client = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_API_KEY!, {
  auth: { persistSession: false },
});

export const supabaseStore = new SupabaseVectorStore(
  new OpenAIEmbeddings({
    openAIApiKey: process.env.OPENAI_API_KEY,
  }),
  {
    client,
    tableName: 'documents',
    queryName: 'match_documents',
  },
);
