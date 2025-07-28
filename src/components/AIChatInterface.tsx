import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { useAISportsChat } from '@/hooks/useAISportsChat';
import { Bot, User, Send, Trash2, Brain } from 'lucide-react';
export const AIChatInterface: React.FC = () => {
  const [inputMessage, setInputMessage] = useState('');
  const {
    messages,
    isLoading,
    sendMessage,
    clearChat
  } = useAISportsChat();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth'
    });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || isLoading) return;
    await sendMessage(inputMessage.trim());
    setInputMessage('');
  };
  const suggestedQuestions = ["How is my readiness trending this week?", "Should I train today based on my recovery?", "What does my sleep data suggest?", "How can I improve my training load?", "Am I overtraining based on my metrics?"];
  const handleSuggestedQuestion = (question: string) => {
    setInputMessage(question);
  };
  return <Card className="h-[600px] flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Brain className="w-6 h-6 text-blue-600" />
            <div>
              <CardTitle>ARIA</CardTitle>
              <CardDescription>
                Ask questions about your training data and get intelligent insights
              </CardDescription>
            </div>
          </div>
          {messages.length > 0 && <Button variant="outline" size="sm" onClick={clearChat} className="flex items-center space-x-1">
              <Trash2 className="w-4 h-4" />
              <span>Clear</span>
            </Button>}
        </div>
      </CardHeader>

      <CardContent className="flex-1 flex flex-col space-y-4 p-4">
        {messages.length === 0 ? <div className="flex-1 flex flex-col items-center justify-center space-y-4">
            <div className="text-center text-gray-500 mb-4">
              <Bot className="w-12 h-12 mx-auto mb-2 text-blue-600" />
              <p className="text-lg font-medium">Welcome to your ARIA</p>
              <p className="text-sm">Ask me anything about your training data, recovery, or performance.</p>
            </div>
            
            <div className="w-full max-w-md space-y-2">
              <p className="text-sm font-medium text-gray-700">Try asking:</p>
              <div className="flex flex-wrap gap-2">
                {suggestedQuestions.map((question, index) => <Badge key={index} variant="outline" className="cursor-pointer hover:bg-blue-50 text-xs" onClick={() => handleSuggestedQuestion(question)}>
                    {question}
                  </Badge>)}
              </div>
            </div>
          </div> : <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4">
              {messages.map(message => <div key={message.id} className={`flex items-start space-x-3 ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {message.role === 'assistant' && <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Bot className="w-4 h-4 text-blue-600" />
                    </div>}
                  
                  <div className={`max-w-[80%] p-3 rounded-lg ${message.role === 'user' ? 'bg-blue-600 text-white ml-auto' : 'bg-gray-100 text-gray-900'}`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <div className="text-xs opacity-70 mt-1">
                      {message.timestamp.toLocaleTimeString()}
                    </div>
                  </div>

                  {message.role === 'user' && <div className="flex-shrink-0 w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>}
                </div>)}
              
              {isLoading && <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <Bot className="w-4 h-4 text-blue-600" />
                  </div>
                  <div className="bg-gray-100 p-3 rounded-lg">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{
                  animationDelay: '0.1s'
                }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{
                  animationDelay: '0.2s'
                }}></div>
                    </div>
                  </div>
                </div>}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>}

        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <Input value={inputMessage} onChange={e => setInputMessage(e.target.value)} placeholder="Ask about your training data, recovery, or performance..." disabled={isLoading} className="flex-1" />
          <Button type="submit" disabled={!inputMessage.trim() || isLoading}>
            <Send className="w-4 h-4" />
          </Button>
        </form>
      </CardContent>
    </Card>;
};