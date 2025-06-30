
import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, FileText, Image, Link2 } from 'lucide-react';
import { useShareUI } from '@/context/ShareUIContext';
import { useShare } from '@/hooks/useShare';
import { useReducedMotion } from '@/hooks/useReducedMotion';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export const ShareSheet: React.FC = () => {
  const { isSheetOpen, shareData, closeSheet } = useShareUI();
  const { isLoading, exportPng, exportCsv, exportPdf, copyShareLink } = useShare();
  const prefersReducedMotion = useReducedMotion();
  const { profile } = useAuth();

  const springConfig = prefersReducedMotion
    ? { duration: 0.1 }
    : {
        type: 'spring' as const,
        stiffness: 260,
        damping: 20,
      };

  const handleExportPng = async () => {
    if (!shareData?.chartRef.current) return;
    await exportPng(shareData.chartRef, shareData.filename);
    closeSheet();
  };

  const handleExportCsv = async () => {
    if (!shareData?.metrics.length) return;
    await exportCsv(shareData.metrics, shareData.filename);
    closeSheet();
  };

  const handleExportPdf = async () => {
    if (!shareData?.chartRef.current) return;
    await exportPdf(shareData.chartRef, shareData.title, shareData.filename);
    closeSheet();
  };

  const handleCopyLink = async () => {
    if (!shareData?.chartRef.current) return;
    const success = await copyShareLink(shareData.chartRef, shareData.filename);
    if (success) {
      toast.success('Link copied to clipboard!');
    } else {
      toast.error('Failed to generate share link');
    }
    closeSheet();
  };

  const hasData = shareData?.metrics && shareData.metrics.length > 0;
  const canShare = profile && hasData;

  const actions = [
    {
      id: 'png',
      label: 'PNG',
      icon: Image,
      action: handleExportPng,
      disabled: !hasData,
      tooltip: hasData ? 'Download as PNG image' : 'No data available'
    },
    {
      id: 'csv',
      label: 'CSV',
      icon: FileText,
      action: handleExportCsv,
      disabled: !hasData,
      tooltip: hasData ? 'Download as CSV file' : 'No data available'
    },
    {
      id: 'pdf',
      label: 'PDF',
      icon: Download,
      action: handleExportPdf,
      disabled: !hasData,
      tooltip: hasData ? 'Download as PDF report' : 'No data available'
    },
    {
      id: 'link',
      label: 'Copy Link',
      icon: Link2,
      action: handleCopyLink,
      disabled: !canShare,
      tooltip: !canShare ? 'Sign in to share links' : 'Copy public share link'
    }
  ];

  return (
    <AnimatePresence>
      {isSheetOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={springConfig}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 md:z-40"
            onClick={closeSheet}
          />
          
          {/* Sheet - Mobile (bottom sheet) */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={springConfig}
            className={cn(
              'fixed bottom-0 left-0 right-0 z-50 bg-card backdrop-blur-lg border-t border-border rounded-t-2xl',
              'md:hidden'
            )}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    Share {shareData?.title}
                  </h2>
                  <p className="text-sm text-white/60 mt-1">
                    Choose how to export your data
                  </p>
                </div>
                <button
                  onClick={closeSheet}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-white/60" />
                </button>
              </div>
              
              <div className="grid grid-cols-2 gap-3 mb-4">
                {actions.map((action, index) => (
                  <motion.button
                    key={action.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ 
                      ...springConfig,
                      delay: prefersReducedMotion ? 0 : index * 0.05 
                    }}
                    onClick={action.action}
                    disabled={action.disabled || isLoading}
                    title={action.tooltip}
                    className={cn(
                      'flex flex-col items-center gap-2 p-4 rounded-xl border border-border',
                      'bg-white/5 hover:bg-white/10 transition-colors',
                      'disabled:opacity-50 disabled:cursor-not-allowed',
                      action.disabled && 'cursor-not-allowed'
                    )}
                  >
                    <action.icon className="w-6 h-6 text-white" />
                    <span className="text-sm font-medium text-white">
                      {action.label}
                    </span>
                  </motion.button>
                ))}
              </div>
              
              <button
                onClick={closeSheet}
                className="w-full py-3 text-sm font-medium text-white/70 hover:text-white transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>

          {/* Modal - Desktop */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={springConfig}
            className={cn(
              'fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-50',
              'bg-card backdrop-blur-lg border border-border rounded-2xl p-6',
              'w-full max-w-md mx-4',
              'hidden md:block'
            )}
          >
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-lg font-semibold text-white">
                  Share {shareData?.title}
                </h2>
                <p className="text-sm text-white/60 mt-1">
                  Choose how to export your data
                </p>
              </div>
              <button
                onClick={closeSheet}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-white/60" />
              </button>
            </div>
            
            <div className="grid grid-cols-2 gap-3 mb-6">
              {actions.map((action, index) => (
                <motion.button
                  key={action.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ 
                    ...springConfig,
                    delay: prefersReducedMotion ? 0 : index * 0.05 
                  }}
                  onClick={action.action}
                  disabled={action.disabled || isLoading}
                  title={action.tooltip}
                  className={cn(
                    'flex flex-col items-center gap-2 p-4 rounded-xl border border-border',
                    'bg-white/5 hover:bg-white/10 transition-colors',
                    'disabled:opacity-50 disabled:cursor-not-allowed'
                  )}
                >
                  <action.icon className="w-6 h-6 text-white" />
                  <span className="text-sm font-medium text-white">
                    {action.label}
                  </span>
                </motion.button>
              ))}
            </div>
            
            <button
              onClick={closeSheet}
              className="w-full py-3 text-sm font-medium text-white/70 hover:text-white transition-colors border border-border rounded-lg hover:bg-white/5"
            >
              Cancel
            </button>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
