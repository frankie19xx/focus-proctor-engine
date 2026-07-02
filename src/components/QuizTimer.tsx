import { useState, useEffect } from 'react';

interface QuizTimerProps {
  durationMinutes: number;
  onTimeUp: () => void;
}

export const QuizTimer: React.FC<QuizTimerProps> = ({ durationMinutes, onTimeUp }) => {
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);

  useEffect(() => {
    if (secondsLeft <= 0) {
      onTimeUp();
      return;
    }

    const timer = setInterval(() => {
      setSecondsLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsLeft, onTimeUp]);

  const minutes = Math.floor(secondsLeft / 60);
  const seconds = secondsLeft % 60;

  return (
    <div className={`text-xl font-mono font-bold ${secondsLeft < 60 ? 'text-destructive' : 'text-primary'}`}>
      {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
    </div>
  );
};
