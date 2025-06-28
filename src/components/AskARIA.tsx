
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { HelpCircle, MessageSquare, Loader2, Sparkles } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

interface AskARIAProps {
  context?: string;
  className?: string;
  variant?: 'icon' | 'button';
}

interface ARIAResponse {
  answer: string;
  sources?: Array<{ title: string; source: string }>;
}

export const AskARIA: React.FC<AskARIAProps> = ({ 
  context = '', 
  className = '',
  variant = 'button' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [sources, setSources] = useState<Array<{ title: string; source: string }>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const suggestedQuestions = [
    "What factors affect readiness scores the most?",
    "How should I interpret ACWR values?",
    "What are the warning signs of overtraining?",
    "How can sleep impact athletic performance?",
    "What's the optimal training load progression?"
  ];

  const handleAsk = async () => {
    if (!question.trim()) {
      toast({
        title: "Question required",
        description: "Please enter a question to ask ARIA",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    setAnswer('');
    setSources([]);

    try {
      const { data, error } = await supabase.functions.invoke('ask_aria', {
        body: { 
          prompt: question,
          context: context
        }
      });

      if (error) {
        console.error('Ask ARIA error:', error);
        throw error;
      }

      const response = data as ARIAResponse;
      setAnswer(response.answer);
      setSources(response.sources || []);

    } catch (error) {
      console.error('Error asking ARIA:', error);
      toast({
        title: "Error",
        description: "Failed to get response from ARIA. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuestion(suggestion);
  };

  const handleClose = () => {
    setIsOpen(false);
    setQuestion('');
    setAnswer('');
    setSources([]);
  };

  const TriggerButton = variant === 'icon' ? (
    <button
      onClick={() => setIsOpen(true)}
      className={`p-1 rounded-full hover:bg-white/10 transition-colors text-white/60 hover:text-white/90 ${className}`}
      title="Ask ARIA about this metric"
    >
      <HelpCircle className="h-4 w-4" />
    </button>
  ) : (
    <Button
      onClick={() => setIsOpen(true)}
      variant="outline"
      size="sm"
      className={`bg-white/5 border-white/10 text-white hover:bg-white/10 ${className}`}
    >
      <Sparkles className="h-4 w-4 mr-2" />
      Ask ARIA
    </Button>
  );

  return (
    <>
      {TriggerButton}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] bg-gray-900/95 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageSquare className="h-5 w-5 text-green-400" />
              Ask ARIA
              {context && (
                <Badge variant="outline" className="ml-2 border-green-400/30 text-green-400">
                  {context}
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Question Input */}
            <div>
              <Textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                placeholder="Ask ARIA anything about training, recovery, load monitoring, or performance..."
                className="min-h-[100px] bg-white/5 border-white/10 text-white placeholder:text-white/50 focus:border-green-400/50"
                disabled={isLoading}
              />
            </div>

            {/* Suggested Questions */}
            {!answer && (
              <div>
                <p className="text-sm text-white/70 mb-2">Suggested questions:</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => handleSuggestionClick(suggestion)}
                      className="text-xs px-3 py-1 bg-white/5 border border-white/10 rounded-full hover:bg-white/10 transition-colors text-white/80"
                      disabled={isLoading}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex justify-end gap-2">
              <Button
                onClick={handleClose}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                disabled={isLoading}
              >
                Close
              </Button>
              <Button
                onClick={handleAsk}
                disabled={isLoading || !question.trim()}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Thinking...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Ask ARIA
                  </>
                )}
              </Button>
            </div>

            {/* Answer */}
            {answer && (
              <div className="mt-6 space-y-4">
                <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-r from-green-500 to-green-600 flex items-center justify-center flex-shrink-0">
                      <Sparkles className="h-4 w-4 text-white" />
                    </div>
                    <div className="flex-1">
                      <h4 className="text-sm font-medium text-green-400 mb-2">ARIA's Response</h4>
                      <div 
                        className="prose prose-sm prose-invert max-w-none text-white/90 leading-relaxed whitespace-pre-wrap"
                      >
                        {answer}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sources */}
                {sources.length > 0 && (
                  <div>
                    <p className="text-sm text-white/70 mb-2">Sources:</p>
                    <div className="flex flex-wrap gap-2">
                      {sources.map((source, index) => (
                        <Badge 
                          key={index}
                          variant="outline" 
                          className="border-green-400/30 text-green-400 text-xs"
                        >
                          {source.title} [{source.source}]
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};
