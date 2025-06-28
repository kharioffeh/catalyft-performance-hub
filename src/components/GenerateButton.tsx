
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateProgramFromTemplate } from '@/hooks/useCreateProgramFromTemplate';
import { useAuth } from '@/contexts/AuthContext';
import { Spinner } from '@/components/ui/spinner';
import { cn } from '@/lib/utils';

interface GenerateButtonProps {
  templateId: string;
  athleteUuid?: string;
  label?: string;
  full?: boolean;
  className?: string;
}

export const GenerateButton: React.FC<GenerateButtonProps> = ({
  templateId,
  athleteUuid,
  label = 'Generate Program',
  full = false,
  className
}) => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { profile } = useAuth();
  const createProgram = useCreateProgramFromTemplate();

  const handleClick = async () => {
    try {
      setLoading(true);
      const programId = await createProgram.mutateAsync({
        templateId,
        athleteUuid: athleteUuid || (profile?.role === 'solo' ? profile.id : undefined),
      });
      navigate(`/program/${programId}`);
    } catch (error) {
      console.error('Failed to create program:', error);
      // Error handling is done in the hook via toast
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading || createProgram.isPending}
      className={cn(
        "relative inline-flex items-center justify-center rounded-xl px-5 py-3",
        "bg-gradient-to-br from-white/15 to-white/5 border border-white/10",
        "backdrop-blur-sm hover:bg-white/10 transition-all duration-200",
        "disabled:opacity-50 disabled:cursor-not-allowed",
        "text-white font-medium",
        full && "w-full",
        className
      )}
    >
      {(loading || createProgram.isPending) ? (
        <Spinner size={18} />
      ) : (
        label
      )}
    </button>
  );
};
