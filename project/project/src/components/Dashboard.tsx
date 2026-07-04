import type { Project, Task, TimeSession } from '../types';

interface DashboardProps {
  projects: Project[];
  tasks: Task[];
  sessions: TimeSession[];
  selectedProjectId: string | null;
}

export function Dashboard({ projects, tasks, sessions, selectedProjectId }: DashboardProps) {
  const totalProjects = projects.length;
  const totalTasks = tasks.length;

  const todoTasks = tasks.filter((task) => task.status === 'todo').length;

  const inProgressTasks = tasks.filter((task) => task.status === 'in_progress').length;

  const doneTasks = tasks.filter((task) => task.status === 'done').length;

  const highPriorityTasks = tasks.filter((task) => task.priority === 'high').length;

  const selectedProject = projects.find((project) => project.id === selectedProjectId);

  const hasSelectedProject = Boolean(selectedProjectId);

  const overdueTasks = tasks.filter((task) => {
    if (!task.due_date) return false;

    return task.status !== 'done' && new Date(task.due_date) < new Date();
  }).length;

  const totalTrackedSeconds = sessions.reduce((sum, session) => sum + session.duration, 0);

  const hours = Math.floor(totalTrackedSeconds / 3600);
  const minutes = Math.floor((totalTrackedSeconds % 3600) / 60);

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
          title: 'High Priority',
          value: highPriorityTasks,
        },
        {
          title: 'Overdue',
          value: overdueTasks,
        },
        {
          title: 'Tracked Time',
          value: `${hours} h ${minutes} min`,
        },
      ]
    : [];

  const cards = [...projectCards, ...selectedProjectCards];

  return (
    <div className="mb-8">
      <h2 className="mb-4 text-2xl font-bold">Dashboard</h2>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        {!hasSelectedProject && (
          <p className="mt-4 text-sm text-gray-500">Select a project to view task statistics.</p>
        )}
        {cards.map((card) => (
          <div key={card.title} className="rounded-lg bg-white p-5 shadow-md">
            <p className="text-sm text-gray-500">{card.title}</p>

            <p className="mt-2 text-2xl font-bold">{card.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
