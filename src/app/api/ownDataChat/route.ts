import { ChatOpenAI } from 'langchain/chat_models/openai';
import { PromptTemplate } from 'langchain/prompts';
import { StreamingTextResponse, Message as VercelChatMessage } from 'ai';
import { supabaseStore } from '@/aiDatabase/supabaseStore';
import { NextResponse } from 'next/server';
import { RunnableSequence, RunnablePassthrough } from 'langchain/schema/runnable';
import { BytesOutputParser, StringOutputParser } from 'langchain/schema/output_parser';

// IMPORTANT! Set the runtime to edge
export const runtime = 'edge';

type ConversationalRetrievalQAChainInput = {
  question: string;
  chat_history: VercelChatMessage[];
};

const formatVercelMessages = (chatHistory: VercelChatMessage[]) => {
  const formattedDialogueTurns = chatHistory.map((message) => {
    if (message.role === 'user') {
      return `Human: ${message.content}`;
    } else if (message.role === 'assistant') {
      return `Assistant: ${message.content}`;
    } else {
      return `${message.role}: ${message.content}`;
    }
  });
  return formattedDialogueTurns.join('\n');
};

const questionTemplate = `Dada a conversa a seguir e uma pergunta de acompanhamento,
  reformule a pergunta de acompanhamento para ser uma pergunta independente, em seu idioma original.

  Histórico de conversa:
  {chat_history}
  Entrada de acompanhamento: {question}
  Pergunta independente:
`;

const questionPrompt = PromptTemplate.fromTemplate<{
  chat_history: string;
  question: string;
}>(questionTemplate);

const answerTemplate = `
  Você é um ávido leitor, que tem respostas filosóficas para todas as perguntas.

  Os dados que irei fornecer são parte do seu conhecimento sobre autores e suas citações mais famosas,
  e é a partir desse dados que você responderá com até 5 citações àqueles que te procuram em busca de aprendizado.

  Lembre-se sempre de informar o nome do autor.

  Para conseguir responder com clareza, use sempre o português e liste as citações caso haja mais de uma.
  
  Caso não encontre a resposta nos dados, diga que não conhece nenhuma citação adequada.

  Responda à pergunta com base apenas no seguinte contexto:
  {context}

  Pergunta:
  {question}
`;

const answerPrompt = PromptTemplate.fromTemplate<{
  context: string;
  question: string;
}>(answerTemplate);

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();
    const previousMessages = messages.slice(0, -1);
    const currentMessageContent = messages[messages.length - 1].content;

    const model = new ChatOpenAI({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: 'gpt-3.5-turbo',
      temperature: 0.3,
    });

    const retriever = supabaseStore.asRetriever();

    const standaloneQuestionChain = RunnableSequence.from([
      {
        question: (input: ConversationalRetrievalQAChainInput) => input.question,
        chat_history: (input: ConversationalRetrievalQAChainInput) =>
          formatVercelMessages(input.chat_history),
      },
      questionPrompt,
      model,
      new StringOutputParser(),
    ]);

    const answerChain = RunnableSequence.from([
      {
        context: retriever,
        question: new RunnablePassthrough(),
      },
      answerPrompt,
      model,
      new BytesOutputParser(),
    ]);

    const conversationalRetrievalQAChain = standaloneQuestionChain.pipe(answerChain);

    // Ask OpenAI for a streaming chat completion given the prompt
    const stream = await conversationalRetrievalQAChain.stream({
      question: currentMessageContent,
      chat_history: previousMessages,
    });

    // Respond with the stream
    return new StreamingTextResponse(stream);
  } catch (err) {
    const error = err as Error;
    return NextResponse.json({ data: false, message: error.message }, { status: 500 });
  }
}
