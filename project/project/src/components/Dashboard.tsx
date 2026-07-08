import type { Project, Task, TimeSession } from '../types';
import { ProductivityCharts } from './ProductivityCharts';
import { Card, CardContent } from '@/components/ui/card';

interface DashboardProps {
  projects: Project[];
  tasks: Task[];
  sessions: TimeSession[];
  selectedProjectId: string | null;
}

export function Dashboard({ projects, tasks, sessions, selectedProjectId }: DashboardProps) {
  const totalProjects = projects.length;
  const totalTasks = tasks.length;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const todoTasks = tasks.filter((task) => task.status === 'todo').length;
  const inProgressTasks = tasks.filter((task) => task.status === 'in_progress').length;
  const doneTasks = tasks.filter((task) => task.status === 'done').length;

  const completionRate = totalTasks === 0 ? 0 : Math.round((doneTasks / totalTasks) * 100);

  const highPriorityTasks = tasks.filter((task) => task.priority === 'high').length;

  const selectedProject = projects.find((project) => project.id === selectedProjectId);
  const hasSelectedProject = Boolean(selectedProjectId);

  const overdueTasks = tasks.filter((task) => {
    if (!task.due_date) return false;

    const dueDate = new Date(task.due_date);
    dueDate.setHours(0, 0, 0, 0);

    return task.status !== 'done' && dueDate < today;
  }).length;

  const dueTodayTasks = tasks.filter((task) => {
    if (!task.due_date) return false;

    const dueDate = new Date(task.due_date);
    dueDate.setHours(0, 0, 0, 0);

    return dueDate.getTime() === today.getTime();
  }).length;

  const totalSessions = sessions.length;

  const totalTrackedSeconds = sessions.reduce((sum, session) => sum + session.duration, 0);

  const averageSessionSeconds =
    totalSessions === 0 ? 0 : Math.round(totalTrackedSeconds / totalSessions);

  const trackedTaskIds = new Set(sessions.map((session) => session.task_id));

  const averageTaskSeconds =
    trackedTaskIds.size === 0 ? 0 : Math.round(totalTrackedSeconds / trackedTaskIds.size);

  const todaySessions = sessions.filter((session) => {
    const startTime = new Date(session.start_time);

    return startTime >= today && startTime < tomorrow;
  });

  const todayTrackedSeconds = todaySessions.reduce((sum, session) => sum + session.duration, 0);

  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    return `${hours} h ${minutes} min`;
  };

  const completedTodayTasks = tasks.filter((task) => {
    if (task.status !== 'done' || !task.completed_at) return false;

    const completedAt = new Date(task.completed_at);

    return completedAt >= today && completedAt < tomorrow;
  }).length;

  const projectCards = [
    {
      title: 'Projects',
      value: totalProjects,
    },
  ];

  const selectedProjectCards = hasSelectedProject
    ? [
        {
          title: 'Selected Project',
          value: selectedProject?.name ?? 'Unknown',
        },
        {
          title: 'Tasks',
          value: totalTasks,
        },
        {
          title: 'To Do',
          value: todoTasks,
        },
        {
          title: 'In Progress',
          value: inProgressTasks,
        },
        {
          title: 'Done',
          value: doneTasks,
        },
        {
          title: 'Completion Rate',
          value: `${completionRate}%`,
        },
        {
          title: 'High Priority',
          value: highPriorityTasks,
        },
        {
          title: 'Overdue',
          value: overdueTasks,
        },
        {
          title: 'Due Today',
          value: dueTodayTasks,
        },
        {
          title: 'Tracked Time',
          value: formatDuration(totalTrackedSeconds),
        },
        {
          title: 'Today Tracked',
          value: formatDuration(todayTrackedSeconds),
        },
        {
          title: 'Sessions',
          value: totalSessions,
        },
        {
          title: 'Average Session',
          value: formatDuration(averageSessionSeconds),
        },
        {
          title: 'Average Task Time',
          value: formatDuration(averageTaskSeconds),
        },
        {
          title: 'Completed Today',
          value: completedTodayTasks,
        },
      ]
    : [];

  const cards = [...projectCards, ...selectedProjectCards];

  return (
    <div className="mb-8 rounded-2xl border border-white/60 bg-white/55 p-4 shadow-lg backdrop-blur dark:border-white/10 dark:bg-gray-900/45 sm:p-6">
      <h2 className="mb-4 text-2xl font-bold">Dashboard</h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
        {!hasSelectedProject && (
          <p className="text-sm text-gray-500 dark:text-gray-400 sm:col-span-2 md:col-span-4">
            Select a project to view task statistics.
          </p>
        )}

        {cards.map((card) => (
          <Card
            key={card.title}
            className="border-white/60 bg-white/80 shadow-md backdrop-blur dark:border-white/10 dark:bg-gray-900/70"
          >
            <CardContent className="p-5">
              <p className="text-sm text-muted-foreground">{card.title}</p>
              <p className="mt-2 text-2xl font-bold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {hasSelectedProject && <ProductivityCharts tasks={tasks} sessions={sessions} />}
    </div>
  );
}
