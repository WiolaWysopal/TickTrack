import { format, parseISO } from 'date-fns';
import type { TimeSession, Task, Project } from '../types';
import { Trash2 } from 'lucide-react';

interface SessionListProps {
  sessions: TimeSession[];
  tasks: Task[];
  projects: Project[];
  onDeleteSession: (sessionId: string) => void;
}

export function SessionList({ sessions, tasks, projects, onDeleteSession }: SessionListProps) {
  const getTaskName = (taskId: string) => {
    return tasks.find((task) => task.id === taskId)?.name || 'Unknown Task';
  };

  const getProjectName = (projectId: string) => {
    return projects.find((project) => project.id === projectId)?.name || 'Unknown Project';
  };

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Time Sessions</h2>
      <div className="space-y-4">
        {sessions.map((session) => (
          <div key={session.id} className="border p-4 rounded-md">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium">{getTaskName(session.task_id)}</h3>
                <p className="text-sm text-gray-600">{getProjectName(session.project_id)}</p>
              </div>
              <div className="flex items-start gap-4">
                <div className="text-right">
                  <p className="text-sm text-gray-600">
                    {format(parseISO(session.start_time), 'MMM d, yyyy HH:mm')}
                  </p>
                  <p className="font-medium">{formatDuration(session.duration)}</p>
                </div>
                <button
                  onClick={() => onDeleteSession(session.id)}
                  className="text-red-500 hover:text-red-700 p-1"
                  title="Delete session"
                >
                  <Trash2 className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
        {sessions.length === 0 && (
          <p className="text-gray-500 text-center py-4">No time sessions recorded yet</p>
        )}
      </div>
    </div>
  );
}