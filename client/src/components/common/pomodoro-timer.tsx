import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Clock, Play, Pause, RotateCcw } from "lucide-react";

export default function PomodoroTimer() {
  const [time, setTime] = useState(25 * 60); // 25 minutes in seconds
  const [isActive, setIsActive] = useState(false);
  const [mode, setMode] = useState<'work' | 'break'>('work');

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    
    if (isActive && time > 0) {
      interval = setInterval(() => {
        setTime(time => time - 1);
      }, 1000);
    } else if (time === 0) {
      // Timer finished
      setIsActive(false);
      if (mode === 'work') {
        setMode('break');
        setTime(5 * 60); // 5 minute break
      } else {
        setMode('work');
        setTime(25 * 60); // Back to work
      }
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isActive, time, mode]);

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const toggleTimer = () => {
    setIsActive(!isActive);
  };

  const resetTimer = () => {
    setIsActive(false);
    setMode('work');
    setTime(25 * 60);
  };

  return (
    <div className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg">
      <Clock className="text-primary" size={16} />
      <span 
        className="text-sm font-medium min-w-[3.5rem]"
        data-testid="timer-display"
      >
        {formatTime(time)}
      </span>
      
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-primary hover:text-primary-dark h-6 px-2"
          onClick={toggleTimer}
          data-testid="button-toggle-timer"
        >
          {isActive ? <Pause size={12} /> : <Play size={12} />}
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-gray-600 hover:text-gray-900 h-6 px-2"
          onClick={resetTimer}
          data-testid="button-reset-timer"
        >
          <RotateCcw size={12} />
        </Button>
      </div>
      
      {mode === 'break' && (
        <span className="text-xs text-success font-medium">استراحة</span>
      )}
    </div>
  );
}
