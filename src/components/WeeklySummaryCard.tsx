
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Mail, Eye, Calendar } from 'lucide-react';
import { useLatestWeeklySummary } from '@/hooks/useWeeklySummaries';
import { format } from 'date-fns';
import { sanitizeHtml } from '@/lib/security';

export const WeeklySummaryCard: React.FC = () => {
  const { data: latestSummary, isLoading } = useLatestWeeklySummary();
  const [showFullSummary, setShowFullSummary] = useState(false);

  if (isLoading) {
    return (
      <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Mail className="h-5 w-5" />
            Weekly Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse">
            <div className="h-4 bg-white/20 rounded mb-2"></div>
            <div className="h-4 bg-white/20 rounded w-3/4"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!latestSummary) {
    return (
      <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Mail className="h-5 w-5" />
            Weekly Summary
          </CardTitle>
          <CardDescription className="text-white/60">
            Your first weekly summary will arrive next Monday
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-white/80 text-sm">
            ARIA will automatically generate and email you a comprehensive weekly performance summary every Monday morning.
          </p>
        </CardContent>
      </Card>
    );
  }

  const summaryPreview = latestSummary.summary_md.substring(0, 120) + '...';
  const sentDate = format(new Date(latestSummary.created_at), 'MMM d, yyyy');

  return (
    <>
      <Card className="bg-white/5 border-white/10 backdrop-blur-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-white">
            <Mail className="h-5 w-5" />
            Latest Weekly Summary
          </CardTitle>
          <CardDescription className="flex items-center gap-2 text-white/60">
            <Calendar className="h-4 w-4" />
            Sent {sentDate}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-white/80 text-sm mb-4 leading-relaxed">
            {summaryPreview}
          </p>
          <Button
            onClick={() => setShowFullSummary(true)}
            variant="outline"
            size="sm"
            className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20"
          >
            <Eye className="h-4 w-4" />
            View Full Summary
          </Button>
        </CardContent>
      </Card>

      <Dialog open={showFullSummary} onOpenChange={setShowFullSummary}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto bg-gray-900/95 border-white/10 text-white">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Mail className="h-5 w-5 text-green-400" />
              Weekly Summary - {sentDate}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4">
            <div 
              className="prose prose-invert prose-sm max-w-none"
              dangerouslySetInnerHTML={{ 
                __html: sanitizeHtml(formatMarkdownForDisplay(latestSummary.summary_md)) 
              }} 
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

function formatMarkdownForDisplay(markdown: string): string {
  return markdown
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold text-green-400 mt-4 mb-2">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold text-green-400 mt-6 mb-3">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold text-green-400 mt-8 mb-4">$1</h1>')
    .replace(/^\* (.*$)/gim, '<li class="mb-1">$1</li>')
    .replace(/^- (.*$)/gim, '<li class="mb-1">$1</li>')
    .replace(/\*\*(.*)\*\*/gim, '<strong class="text-green-400">$1</strong>')
    .replace(/\*(.*)\*/gim, '<em class="text-white/80">$1</em>')
    .replace(/\n\n/g, '</p><p class="mb-3">')
    .replace(/^(?!<[h|l|p])/gm, '<p class="mb-3">')
    .replace(/(?<![h|l|p]>)$/gm, '</p>')
    .replace(/<li class="mb-1">/g, '<ul class="list-disc list-inside mb-3 text-white/90"><li class="mb-1">')
    .replace(/<\/li>/g, '</li></ul>')
    .replace(/<\/ul><ul class="list-disc list-inside mb-3 text-white\/90">/g, '');
}
