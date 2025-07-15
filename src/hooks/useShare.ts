
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { capturePng, makePdf, toCsv } from '@/utils/exportMetrics';
import { saveAs } from 'file-saver';
import { useAuth } from '@/contexts/AuthContext';

export const useShare = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { profile } = useAuth();

  const uploadToSupabase = async (blob: Blob, filename: string): Promise<string | null> => {
    try {
      const { data, error } = await supabase.storage
        .from('shares')
        .upload(`${Date.now()}-${filename}`, blob, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Upload error:', error);
        return null;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('shares')
        .getPublicUrl(data.path);

      return publicUrl;
    } catch (error) {
      console.error('Upload failed:', error);
      return null;
    }
  };

  const exportPng = async (chartRef: React.RefObject<HTMLElement>, filename: string) => {
    if (!chartRef.current) return;
    
    setIsLoading(true);
    try {
      const pngDataUrl = await capturePng(chartRef.current);
      
      // Convert data URL to blob
      const response = await fetch(pngDataUrl);
      const blob = await response.blob();
      
      saveAs(blob, `${filename}.png`);
    } catch (error) {
      console.error('PNG export failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportCsv = async (metrics: any[], filename: string) => {
    setIsLoading(true);
    try {
      toCsv(metrics, filename);
    } catch (error) {
      console.error('CSV export failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const exportPdf = async (chartRef: React.RefObject<HTMLElement>, title: string, filename: string) => {
    if (!chartRef.current) return;
    
    setIsLoading(true);
    try {
      const pngDataUrl = await capturePng(chartRef.current);
      const pdfBlob = await makePdf(pngDataUrl, title);
      saveAs(pdfBlob, `${filename}.pdf`);
    } catch (error) {
      console.error('PDF export failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const copyShareLink = async (chartRef: React.RefObject<HTMLElement>, filename: string): Promise<boolean> => {
    if (!chartRef.current || !profile) return false;
    
    setIsLoading(true);
    try {
      const pngDataUrl = await capturePng(chartRef.current);
      const response = await fetch(pngDataUrl);
      const blob = await response.blob();
      
      const publicUrl = await uploadToSupabase(blob, `${filename}.png`);
      
      if (publicUrl) {
        await navigator.clipboard.writeText(publicUrl);
        return true;
      } else {
        // Fallback to download
        saveAs(blob, `${filename}.png`);
        return false;
      }
    } catch (error) {
      console.error('Share link failed:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    exportPng,
    exportCsv,
    exportPdf,
    copyShareLink,
  };
};
