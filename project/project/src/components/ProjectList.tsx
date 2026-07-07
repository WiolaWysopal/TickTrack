import { useState } from 'react';
import type { Project } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface ProjectListProps {
  projects: Project[];
  onAddProject: (project: { name: string }) => void;
  onSelectProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  selectedProjectId: string | null;
}

export function ProjectList({
  projects,
  onAddProject,
  onSelectProject,
  onDeleteProject,
  selectedProjectId,
}: ProjectListProps) {
  const [newProjectName, setNewProjectName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      onAddProject({ name: newProjectName });
      setNewProjectName('');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Projects</CardTitle>
      </CardHeader>
      <CardContent className="pt-0">
        <form onSubmit={handleSubmit} className="mt-2 mb-4">
          <div className="flex gap-2">
            <Input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              placeholder="New project name"
              className="flex-1"
            />
            <Button type="submit">Add</Button>
          </div>
        </form>
        <ul className="space-y-2 pb-2">
          {projects.map((project) => (
            <li
              key={project.id}
              className={`rounded-md border p-3 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 ${
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
                <Button variant="ghost" size="sm" onClick={() => onDeleteProject(project.id)}>
                  Delete
                </Button>
              </div>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
