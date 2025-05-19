import { useState, useEffect } from 'react';

interface TimerProps {
  projectName: string;
  taskName: string;
  onSaveSession: (session: { startTime: string; endTime: string; duration: number }) => void;
}

export function Timer({ projectName, taskName, onSaveSession }: TimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [startTime, setStartTime] = useState<Date | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;

    if (isRunning) {
      intervalId = setInterval(() => {
        setElapsedTime((prev) => prev + 1);
      }, 1000);
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [isRunning]);

  const handleStart = () => {
    setIsRunning(true);
    setStartTime(new Date());
  };

  const handleStop = () => {
    if (startTime) {
      const endTime = new Date();
      setIsRunning(false);
      onSaveSession({
        startTime: startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration: elapsedTime,
      });
      setElapsedTime(0);
      setStartTime(null);
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
      <div className="flex gap-4">
        {!isRunning ? (
          <button
            onClick={handleStart}
            className="bg-green-500 text-white px-6 py-2 rounded-md hover:bg-green-600"
          >
            Start
          </button>
        ) : (
          <button
            onClick={handleStop}
            className="bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600"
          >
            Stop
          </button>
        )}
      </div>
    </div>
  );
}