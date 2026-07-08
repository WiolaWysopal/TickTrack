import { format, parseISO } from 'date-fns';
import type { TimeSession, Task, Project } from '../types';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

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
    <Card className="border-white/60 bg-white/80 shadow-lg backdrop-blur dark:border-white/10 dark:bg-gray-900/70">
      <CardHeader className="px-6 pt-6 pb-4">
        <CardTitle className="leading-normal tracking-normal">Time Sessions</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-0">
        <div className="space-y-4 pb-2">
          {sessions.map((session) => (
            <div key={session.id} className="rounded-md border p-4 dark:border-gray-700">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{getTaskName(session.task_id)}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    {getProjectName(session.project_id)}
                  </p>
                </div>
                <div className="flex items-start gap-4">
                  <div className="text-right">
                    <p className="text-sm text-gray-600 dark:text-gray-300">
                      {format(parseISO(session.start_time), 'MMM d, yyyy HH:mm')}
                    </p>
                    <p className="font-medium">{formatDuration(session.duration)}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteSession(session.id)}
                    title="Delete session"
                  >
                    <Trash2 className="h-5 w-5 text-red-500" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
          {sessions.length === 0 && (
            <p className="py-8 text-center text-gray-500 dark:text-gray-400">
              No time sessions recorded yet
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
