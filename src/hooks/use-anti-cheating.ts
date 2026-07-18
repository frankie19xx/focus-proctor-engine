import { useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export type CheatingViolationType = 'tab_switch' | 'window_blur';

interface AntiCheatingOptions {
  maxStrikes?: number;
  onViolation?: (strikes: number) => void;
  onExceeded?: () => void;
  /** Fired for every violation (including the one that exceeds maxStrikes),
   * so callers can persist it (e.g. to the cheating_logs table). */
  onLogViolation?: (type: CheatingViolationType, strikeNumber: number) => void;
  enabled?: boolean;
}

export function useAntiCheating({
  maxStrikes = 3,
  onViolation,
  onExceeded,
  onLogViolation,
  enabled = true,
}: AntiCheatingOptions = {}) {
  const [strikes, setStrikes] = useState(0);

  const handleViolation = useCallback((type: CheatingViolationType) => {
    if (!enabled) return;

    setStrikes((prev) => {
      const newStrikes = prev + 1;
      onLogViolation?.(type, newStrikes);

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
  }, [enabled, maxStrikes, onViolation, onExceeded, onLogViolation]);

  useEffect(() => {
    if (!enabled) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        handleViolation('tab_switch');
      }
    };

    const handleBlur = () => {
      handleViolation('window_blur');
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
