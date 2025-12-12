import { useState } from 'react';
import type { Task } from '../types';
import PdfUpload from './PdfUpload'; // importujemy komponent
import TaskFilesList from './TaskFilesList';

interface TaskListProps {
  tasks: Task[];
  selectedProjectId: string | null;
  selectedTaskId: string | null;
  onAddTask: (task: { name: string; projectId: string }) => void;
  onSelectTask: (taskId: string) => void;
  onDeleteTask: (taskId: string) => void;
}

export function TaskList({ tasks, selectedProjectId, selectedTaskId, onAddTask, onSelectTask, onDeleteTask }: TaskListProps) {
  const [newTaskName, setNewTaskName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskName.trim() && selectedProjectId) {
      onAddTask({ 
        name: newTaskName.trim(), 
        projectId: selectedProjectId 
      });
      setNewTaskName('');
    }
  };

  const filteredTasks = tasks.filter((task) => task.project_id === selectedProjectId);

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Tasks</h2>
      
      {selectedProjectId ? (
        <form onSubmit={handleSubmit} className="mb-4">
          <div className="flex gap-2">
            <input
              type="text"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              placeholder="New task name"
              className="flex-1 px-3 py-2 border rounded-md"
            />
            <button
              type="submit"
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
            >
              Add
            </button>
          </div>
        </form>
      ) : (
        <p className="text-gray-500 mb-4">Select a project to add tasks</p>
      )}

      <ul className="space-y-2 mb-4">
        {filteredTasks.map((task) => (
          <li
            key={task.id}
            className={`p-3 border rounded-md hover:bg-gray-50 ${
              selectedTaskId === task.id ? 'border-blue-500' : ''
            }`}
          >
            <div className="flex justify-between items-center">
              <span
                onClick={() => onSelectTask(task.id)}
                className="cursor-pointer flex-grow"
              >
                {task.name}
              </span>
              <button
                onClick={() => onDeleteTask(task.id)}
                className="text-red-500 hover:text-red-700 px-2 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* Tu dodajemy komponent upload PDF tylko dla wybranego taska */}
      {/* {selectedTaskId && (
  <div className="mt-4">
    <PdfUpload
      taskId={selectedTaskId}
      onUploadSuccess={() => {
        // opcjonalnie: odśwież listę plików po uploadzie
      }}
    />
    <TaskFilesList taskId={selectedTaskId} />
  </div>
)} */}

    </div>
  );
}
