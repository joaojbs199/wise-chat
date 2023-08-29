import path from 'node:path';
import { supabaseStore } from '@/aiDatabase/supabaseStore';
import { DirectoryLoader } from 'langchain/document_loaders/fs/directory';
import { JSONLoader } from 'langchain/document_loaders/fs/json';
import { TokenTextSplitter } from 'langchain/text_splitter';
import { NextResponse } from 'next/server';

export async function PUT() {
  try {
    // Loader all JSON files from folder
    const loader = new DirectoryLoader(path.resolve('./src/aiDatabase/JSON-files'), {
      '.json': (path) => new JSONLoader(path, '/quote'),
    });

    // Load unique JSON file
    // const loader = new JSONLoader('./src/aiDatabase/quotes.json', '/quote');

    const docs = await loader.load();

    const splitter = new TokenTextSplitter({
      encodingName: 'cl100k_base',
      chunkSize: 600,
      chunkOverlap: 0,
    });

    const splittedDocuments = await splitter.splitDocuments(docs);

    supabaseStore.addDocuments(splittedDocuments);

    return NextResponse.json(
      { data: true, message: 'You have successfully load data to Supabase.' },
      { status: 201 },
    );
  } catch (err) {
    const error = err as Error;
    console.error('ERROR', err);
    process.exit(1);

    return NextResponse.json(
      { data: false, message: `Data not load. | ${error.message}` },
      { status: 422 },
    );
  }
}
