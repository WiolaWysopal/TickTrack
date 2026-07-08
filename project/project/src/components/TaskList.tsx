import { useState } from 'react';
import type { Task } from '../types';
import PdfUpload from './PdfUpload';
import TaskFilesList from './TaskFilesList';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

interface TaskListProps {
  tasks: Task[];
  selectedProjectId: string | null;
  selectedTaskId: string | null;
  onAddTask: (task: {
    name: string;
    projectId: string;
    status: string;
    priority: string;
    description: string | null;
    dueDate: string | null;
  }) => void;
  onSelectTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
  onUpdateTask: (
    taskId: string,
    updates: {
      status?: string;
      priority?: string;
    }
  ) => void;
}

export function TaskList({
  tasks,
  selectedProjectId,
  selectedTaskId,
  onAddTask,
  onSelectTask,
  onDeleteTask,
  onUpdateTask,
}: TaskListProps) {
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskStatus, setNewTaskStatus] = useState('todo');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [filesRefreshKey, setFilesRefreshKey] = useState(0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (newTaskName.trim() && selectedProjectId) {
      onAddTask({
        name: newTaskName.trim(),
        projectId: selectedProjectId,
        status: newTaskStatus,
        priority: newTaskPriority,
        description: newTaskDescription.trim() || null,
        dueDate: newTaskDueDate || null,
      });

      setNewTaskName('');
      setNewTaskStatus('todo');
      setNewTaskPriority('medium');
      setNewTaskDescription('');
      setNewTaskDueDate('');
    }
  };

  const filteredTasks = tasks
    .filter((task) => task.project_id === selectedProjectId)
    .filter((task) => statusFilter === 'all' || task.status === statusFilter)
    .filter((task) => priorityFilter === 'all' || task.priority === priorityFilter)
    .sort((a, b) => {
      if (sortBy === 'name') {
        return a.name.localeCompare(b.name);
      }

      if (sortBy === 'priority') {
        const priorityOrder: Record<string, number> = {
          high: 1,
          medium: 2,
          low: 3,
        };

        return priorityOrder[a.priority] - priorityOrder[b.priority];
      }

      if (sortBy === 'status') {
        const statusOrder: Record<string, number> = {
          todo: 1,
          in_progress: 2,
          done: 3,
        };

        return statusOrder[a.status] - statusOrder[b.status];
      }

      return 0;
    });

  return (
    <Card className="border-white/60 bg-white/80 shadow-lg backdrop-blur dark:border-white/10 dark:bg-gray-900/70">
      <CardHeader className="px-6 pt-6 pb-4">
        <CardTitle className="leading-normal tracking-normal">Tasks</CardTitle>
      </CardHeader>
      <CardContent className="px-6 pb-6 pt-0">
        {selectedProjectId ? (
          <form onSubmit={handleSubmit} className="mt-2 mb-6">
            <div className="grid grid-cols-1 gap-2 lg:grid-cols-[1fr_180px_180px_auto]">
              <Input
                type="text"
                value={newTaskName}
                onChange={(e) => setNewTaskName(e.target.value)}
                placeholder="New task name"
                className="w-full"
              />

              <select
                value={newTaskStatus}
                onChange={(e) => setNewTaskStatus(e.target.value)}
                className="rounded-md border px-3 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
              >
                <option value="todo">To do</option>
                <option value="in_progress">In progress</option>
                <option value="done">Done</option>
              </select>

              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(e.target.value)}
                className="rounded-md border px-3 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>

              <Button type="submit" className="w-full lg:w-auto">
                Add
              </Button>
            </div>
            <div className="mt-2 grid grid-cols-1 gap-2">
              <Textarea
                value={newTaskDescription}
                onChange={(e) => setNewTaskDescription(e.target.value)}
                placeholder="Task description"
                className="min-h-20"
              />

              <div>
                <label className="mb-1 block text-sm text-gray-600 dark:text-gray-300">
                  Due date
                </label>

                <Input
                  type="date"
                  value={newTaskDueDate}
                  onChange={(e) => setNewTaskDueDate(e.target.value)}
                />
              </div>
            </div>
          </form>
        ) : (
          <p className="text-gray-500 dark:text-gray-400 mb-4">Select a project to add tasks</p>
        )}

        {selectedProjectId && (
          <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-md border px-3 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
            >
              <option value="all">All statuses</option>
              <option value="todo">To Do</option>
              <option value="in_progress">In Progress</option>
              <option value="done">Done</option>
            </select>

            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="rounded-md border px-3 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
            >
              <option value="all">All priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="rounded-md border px-3 py-2 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-400"
            >
              <option value="newest">Default</option>
              <option value="name">Name</option>
              <option value="priority">Priority</option>
              <option value="status">Status</option>
            </select>
          </div>
        )}

        <ul className="space-y-2 pb-2">
          {filteredTasks.map((task) => {
            const today = new Date();
            today.setHours(0, 0, 0, 0);

            const dueDate = task.due_date ? new Date(task.due_date) : null;

            if (dueDate) {
              dueDate.setHours(0, 0, 0, 0);
            }

            const isOverdue = dueDate !== null && task.status !== 'done' && dueDate < today;

            return (
              <li
                key={task.id}
                className={`rounded-md border p-3 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 ${
                  selectedTaskId === task.id ? 'border-blue-500' : ''
                } ${isOverdue ? 'border-red-300 bg-red-50 dark:border-red-700 dark:bg-red-950/40' : ''}`}
              >
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <span onClick={() => onSelectTask(task.id)} className="cursor-pointer flex-grow">
                    {task.name}
                  </span>

                  <div className="flex flex-wrap gap-2">
                    <StatusBadge
                      value={task.status}
                      onChange={(status) => onUpdateTask(task.id, { status })}
                    />

                    <PriorityBadge
                      value={task.priority}
                      onChange={(priority) => onUpdateTask(task.id, { priority })}
                    />
                  </div>

                  <Button variant="ghost" size="sm" onClick={() => onDeleteTask(task.id)}>
                    Delete
                  </Button>
                </div>
                {task.description && (
                  <p className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                    {task.description}
                  </p>
                )}

                {task.due_date && (
                  <p
                    className={`mt-1 text-xs ${
                      isOverdue ? 'text-red-600 font-medium' : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {isOverdue ? <span className="font-semibold">⚠️ Overdue: </span> : 'Due date: '}
                    {task.due_date}
                  </p>
                )}
                {selectedTaskId === task.id && (
                  <div className="mt-4 border-t pt-4">
                    <PdfUpload
                      taskId={task.id}
                      onUploadSuccess={() => setFilesRefreshKey((prev) => prev + 1)}
                    />

                    <TaskFilesList taskId={task.id} refreshKey={filesRefreshKey} />
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </CardContent>
    </Card>
  );
}
