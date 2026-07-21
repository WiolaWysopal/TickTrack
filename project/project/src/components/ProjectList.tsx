import { useState } from 'react';
import { Star } from 'lucide-react';

import type { Project } from '../types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

interface ProjectListProps {
  projects: Project[];
  onAddProject: (project: { name: string }) => void;
  onSelectProject: (projectId: string) => void;
  onDeleteProject: (projectId: string) => void;
  onToggleFavorite: (projectId: string, isFavorite: boolean) => void;
  selectedProjectId: string | null;
}

export function ProjectList({
  projects,
  onAddProject,
  onSelectProject,
  onDeleteProject,
  onToggleFavorite,
  selectedProjectId,
}: ProjectListProps) {
  const [newProjectName, setNewProjectName] = useState('');
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (newProjectName.trim()) {
      onAddProject({ name: newProjectName.trim() });
      setNewProjectName('');
    }
  };

  const visibleProjects = [...projects]
    .filter((project) => !showFavoritesOnly || project.is_favorite)
    .sort((a, b) => Number(b.is_favorite) - Number(a.is_favorite));

  return (
    <Card className="border-white/60 bg-white/80 shadow-lg backdrop-blur dark:border-white/10 dark:bg-gray-900/70">
      <CardHeader className="px-6 pt-6 pb-4">
        <div className="flex items-center justify-between gap-2">
          <CardTitle>Projects</CardTitle>

          <Button
            type="button"
            variant={showFavoritesOnly ? 'default' : 'outline'}
            size="sm"
            onClick={() => setShowFavoritesOnly((current) => !current)}
          >
            <Star className={`mr-2 h-4 w-4 ${showFavoritesOnly ? 'fill-current' : ''}`} />
            Favorites
          </Button>
        </div>
      </CardHeader>

      <CardContent className="px-6 pb-6 pt-0">
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

        {visibleProjects.length === 0 ? (
          <p className="py-4 text-sm text-gray-500 dark:text-gray-400">
            {showFavoritesOnly ? 'No favorite projects yet.' : 'No projects yet.'}
          </p>
        ) : (
          <ul className="space-y-2 pb-2">
            {visibleProjects.map((project) => (
              <li
                key={project.id}
                className={`rounded-md border p-3 hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800 ${
                  selectedProjectId === project.id ? 'border-blue-500' : ''
                }`}
              >
                <div className="flex items-center justify-between gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectProject(project.id)}
                    className="min-w-0 flex-grow truncate text-left"
                  >
                    {project.name}
                  </button>

                  <div className="flex shrink-0 items-center gap-1">
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => onToggleFavorite(project.id, !project.is_favorite)}
                      aria-label={
                        project.is_favorite
                          ? 'Remove project from favorites'
                          : 'Add project to favorites'
                      }
                      title={project.is_favorite ? 'Remove from favorites' : 'Add to favorites'}
                    >
                      <Star
                        className={`h-5 w-5 ${
                          project.is_favorite ? 'fill-yellow-400 text-yellow-500' : 'text-gray-400'
                        }`}
                      />
                    </Button>

                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteProject(project.id)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
