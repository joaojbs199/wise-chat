'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Square, Loader2, Ban } from 'lucide-react';
import isEmpty from 'is-empty';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useChat } from 'ai/react';
import { ScrollArea } from '../ui/scroll-area';
import { Message } from 'ai';
import { useEffect, useRef } from 'react';

export default function Chat() {
  const { messages, input, handleInputChange, handleSubmit, stop, isLoading, setMessages } =
    useChat({
      api: 'api/ownDataChat',
    });

  const firstMessage: Message = {
    id: 'open-message',
    content:
      'Olá! Sou uma IA pronta para responder à questões sobre desenvolvimento pessoal.\nCom base nos maiores filósofos e pensadores da história, posso te ajudar a chegar numa conclusão sobre as dúvidas mais comuns da existência.\nPergunte-me por exemplo: "Como alcançar o sucesso?"',
    role: 'assistant',
  };

  const messagesDiv = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const newMessages = [...messages, firstMessage];

    if (isEmpty(messages)) {
      setMessages(newMessages);
    }
  }, []);

  useEffect(() => {
    if (messages[messages.length - 1]?.content.length) {
      messagesDiv.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'end',
      });
    }
  }, [messages[messages.length - 1]?.content.length]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50">
      <Card className="relative w-[440px]">
        <CardHeader className="mb-3 bg-slate-100">
          <CardTitle className="underline">Wise Chat</CardTitle>
          <CardDescription className="font-light">A Vercel SDK chatbot</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <ScrollArea className="h-[600px] w-full pr-6">
            {messages.map((message) => {
              const { id, role, content } = message;
              return (
                <div key={id}>
                  {role === 'user' && (
                    <div className="mb-5 flex justify-end gap-3 text-sm text-slate-600">
                      <p className="whitespace-pre-line leading-relaxed">
                        <span className="block text-end font-bold text-slate-700">João:</span>
                        {content}
                      </p>
                      <Avatar className="rounded-full border border-slate-300">
                        <AvatarFallback>JS</AvatarFallback>
                        <AvatarImage src="https://github.com/joaojbs199.png" />
                      </Avatar>
                    </div>
                  )}
                  {role === 'assistant' && (
                    <div className="mb-4 flex gap-3 text-sm text-slate-600">
                      <Avatar className="rounded-full border border-slate-300">
                        <AvatarFallback>WC</AvatarFallback>
                      </Avatar>
                      <p className="whitespace-pre-line leading-relaxed">
                        <span className="block font-bold text-slate-700">Wise chat:</span>
                        {content}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesDiv} />
          </ScrollArea>
        </CardContent>
        <CardFooter className="flex flex-wrap">
          <div className="flex w-full items-center justify-end gap-4">
            {messages.length > 1 && (
              <Button
                className="my-1 h-fit bg-slate-200 text-sm font-light text-slate-700 hover:text-slate-100"
                type="button"
                onClick={() => {
                  stop();
                  setMessages([firstMessage]);
                }}
              >
                <Ban className="mr-1 h-4 w-4" color="#fe4d4d" />
                Limpar chat
              </Button>
            )}
            {isLoading && (
              <Button
                className="my-1 h-fit bg-slate-200 text-sm font-light text-slate-700 hover:text-slate-100"
                type="button"
                onClick={stop}
              >
                <Square className="mr-1 h-4 w-4" color="#fe4d4d" />
                Parar respostas
              </Button>
            )}
          </div>
          <form className="flex w-full gap-2" onSubmit={handleSubmit}>
            <Input
              className="outline-none focus-visible:ring-1 focus-visible:ring-slate-300 focus-visible:ring-offset-0"
              placeholder="Sobre o que está pensado hoje?"
              value={input}
              onChange={handleInputChange}
            />
            <Button className="min-w-[70px]" type="submit">
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin font-extrabold" /> : 'Enviar'}
            </Button>
          </form>
        </CardFooter>
      </Card>
    </div>
  );
}
