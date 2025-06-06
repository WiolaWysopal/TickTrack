import { useState, useEffect } from 'react';
import { Pause, Play, Square } from 'lucide-react';

interface TimerProps {
  projectName: string;
  taskName: string;
  onSaveSession: (session: { startTime: string; endTime: string; duration: number }) => void;
}

export function Timer({ projectName, taskName, onSaveSession }: TimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [pausedTime, setPausedTime] = useState(0);
  const [lastPauseTime, setLastPauseTime] = useState<Date | null>(null);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    if (isRunning && !isPaused) {
      intervalId = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning, isPaused]);

  const handleStart = () => {
    setIsRunning(true);
    setIsPaused(false);
    setStartTime(new Date());
  };

  const handlePause = () => {
    setIsPaused(true);
    setLastPauseTime(new Date());
  };

  const handleResume = () => {
    setIsPaused(false);
    if (lastPauseTime) {
      const now = new Date();
      const pauseDuration = Math.floor((now.getTime() - lastPauseTime.getTime()) / 1000);
      setPausedTime(prev => prev + pauseDuration);
    }
  };

  const handleStop = () => {
    if (startTime) {
      const endTime = new Date();
      setIsRunning(false);
      setIsPaused(false);
      onSaveSession({
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: elapsedTime,
      });
      setElapsedTime(0);
      setPausedTime(0);
      setStartTime(null);
      setLastPauseTime(null);
    }
  };

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`fixed md:relative bg-white p-6 rounded-lg shadow-md transition-all duration-300 ease-in-out z-50 ${
      isRunning 
        ? 'bottom-0 left-0 right-0 md:bottom-auto' 
        : 'bottom-0 left-0 right-0 md:bottom-auto'
    }`}>
      <div className="mb-4">
        <h2 className="text-xl font-semibold text-gray-900">{projectName}</h2>
        <p className="text-gray-600">{taskName}</p>
      </div>
      <div className="text-4xl font-mono mb-4">{formatTime(elapsedTime)}</div>
      <div className="flex gap-4 justify-center">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600 flex items-center gap-2"
          >
            <Play className="w-5 h-5" />
            <span>Start</span>
          </button>
        ) : (
          <>
            {isPaused ? (
              <button
                onClick={handleResume}
                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 flex items-center gap-2"
              >
                <Play className="w-5 h-5" />
                <span>Resume</span>
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="bg-yellow-500 text-white px-6 py-2 rounded-md hover:bg-yellow-600 flex items-center gap-2"
              >
                <Pause className="w-5 h-5" />
                <span>Pause</span>
              </button>
            )}
            <button
              onClick={handleStop}
              className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600 flex items-center gap-2"
            >
              <Square className="w-5 h-5" />
              <span>Stop</span>
            </button>
          </>
        )}
      </div>
      {isPaused && (
        <p className="text-yellow-600 text-sm mt-2 text-center">Timer paused</p>
      )}
    </div>
  );
}