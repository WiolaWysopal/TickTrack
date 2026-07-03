import { useState } from 'react';
import type { Task } from '../types';
import PdfUpload from './PdfUpload';
import TaskFilesList from './TaskFilesList';
import { StatusBadge } from './StatusBadge';
import { PriorityBadge } from './PriorityBadge';

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
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Tasks</h2>

      {selectedProjectId ? (
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-4">
            <input
              type="text"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              placeholder="New task name"
              className="px-3 py-2 border rounded-md sm:col-span-2"
            />

            <select
              value={newTaskStatus}
              onChange={(e) => setNewTaskStatus(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="todo">To do</option>
              <option value="in_progress">In progress</option>
              <option value="done">Done</option>
            </select>

            <select
              value={newTaskPriority}
              onChange={(e) => setNewTaskPriority(e.target.value)}
              className="px-3 py-2 border rounded-md"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>

            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 w-full"
            >
              Add
            </button>
          </div>
          <div className="mt-2 grid grid-cols-1 gap-2">
            <textarea
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              placeholder="Task description"
              className="min-h-20 px-3 py-2 border rounded-md"
            />

            <input
              type="date"
              value={newTaskDueDate}
              onChange={(e) => setNewTaskDueDate(e.target.value)}
              className="px-3 py-2 border rounded-md"
            />
          </div>
        </form>
      ) : (
        <p className="text-gray-500 mb-4">Select a project to add tasks</p>
      )}

      {selectedProjectId && (
        <div className="mb-4 grid grid-cols-1 gap-2 sm:grid-cols-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">All statuses</option>
            <option value="todo">To Do</option>
            <option value="in_progress">In Progress</option>
            <option value="done">Done</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="all">All priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 border rounded-md"
          >
            <option value="newest">Default</option>
            <option value="name">Name</option>
            <option value="priority">Priority</option>
            <option value="status">Status</option>
          </select>
        </div>
      )}

      <ul className="space-y-2">
        {filteredTasks.map((task) => (
          <li
            key={task.id}
            className={`p-3 border rounded-md hover:bg-gray-50 ${
              selectedTaskId === task.id ? 'border-blue-500' : ''
            }`}
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

              <button
                onClick={() => onDeleteTask(task.id)}
                className="text-red-500 hover:text-red-700 px-2 py-1 rounded"
              >
                Delete
              </button>
            </div>
            {task.description && <p className="mt-2 text-sm text-gray-600">{task.description}</p>}

            {task.due_date && (
              <p className="mt-1 text-xs text-gray-500">Due date: {task.due_date}</p>
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
        ))}
      </ul>
    </div>
  );
}
