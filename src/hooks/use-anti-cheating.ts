import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

interface AntiCheatingOptions {
  maxStrikes?: number;
  onViolation?: (strikes: number) => void;
  onExceeded?: () => void;
  enabled?: boolean;
}

export function useAntiCheating({
  maxStrikes = 3,
  onViolation,
  onExceeded,
  enabled = true,
}: AntiCheatingOptions = {}) {
  const [strikes, setStrikes] = useState(0);

  const handleViolation = useCallback(() => {
    if (!enabled) return;

    setStrikes((prev) => {
      const newStrikes = prev + 1;
      
      if (newStrikes >= maxStrikes) {
        toast.error('Maximum violations reached. Exam submitted automatically.', {
          duration: 5000,
        });
        onExceeded?.();
      } else {
        toast.warning(`Warning: Stay on the exam page! (Strike ${newStrikes}/${maxStrikes})`, {
          duration: 3000,
        });
        onViolation?.(newStrikes);
      }
      
      return newStrikes;
    });
  }, [enabled, maxStrikes, onViolation, onExceeded]);

  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation();
      }
    };

    const handleBlur = () => {
      handleViolation();
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('blur', handleBlur);
    };
  }, [enabled, handleViolation]);

  const resetStrikes = () => setStrikes(0);

  return { strikes, resetStrikes };
}
