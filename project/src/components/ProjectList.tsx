import { useState } from 'react';
import type { Project } from '../types';

interface ProjectListProps {
  projects: Project[];
  onAddProject: (project: { name: string }) => void;
  onSelectProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  selectedProjectId: string | null;
}

export function ProjectList({ projects, onAddProject, onSelectProject, onDeleteProject, selectedProjectId }: ProjectListProps) {
  const [newProjectName, setNewProjectName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      onAddProject({ name: newProjectName });
      setNewProjectName('');
    }
  };

  return (
    <div className="bg-white p-6 rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4">Projects</h2>
      <form onSubmit={handleSubmit} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={newProjectName}
            onChange={(e) => setNewProjectName(e.target.value)}
            placeholder="New project name"
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
      <ul className="space-y-2">
        {projects.map((project) => (
          <li
            key={project.id}
            className={`p-3 border rounded-md hover:bg-gray-50 ${
              selectedProjectId === project.id ? 'border-blue-500' : ''
            }`}
          >
            <div className="flex justify-between items-center">
              <span
                onClick={() => onSelectProject(project.id)}
                className="cursor-pointer flex-grow"
              >
                {project.name}
              </span>
              <button
                onClick={() => onDeleteProject(project.id)}
                className="text-red-500 hover:text-red-700 px-2 py-1 rounded"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}