import { useState, useEffect } from 'react';
import { Timer } from './components/Timer';
import { ProjectList } from './components/ProjectList';
import { TaskList } from './components/TaskList';
import { SessionList } from './components/SessionList';
import { Auth } from './components/Auth';
import { AdSense } from './components/AdSense';
import { ProfileDialog } from './components/ProfileDialog';
import { CalendarView } from './components/CalendarView';
import { supabase, clearAuthData } from './lib/supabase';
import type { Project, Task, TimeSession } from './types';
import type { User } from '@supabase/supabase-js';
import { LogOut, UserX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Dashboard } from './components/Dashboard';
import { ThemeToggle } from './components/ThemeToggle';
import { applyTheme, getInitialTheme, type Theme } from './lib/theme';

import { Input } from '@/components/ui/input';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Toaster } from '@/components/ui/sonner';
import { toast } from 'sonner';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [sessions, setSessions] = useState<TimeSession[]>([]);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [theme, setTheme] = useState<Theme>(() => getInitialTheme());
  const [activeView, setActiveView] = useState<'dashboard' | 'calendar'>('dashboard');

  const navigate = useNavigate();

  useEffect(() => {
    applyTheme(theme);
  }, [theme]);

  useEffect(() => {
    // Check current auth status
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (!session?.user) {
        // Clear all state when user signs out
        setProjects([]);
        setTasks([]);
        setSessions([]);
        setSelectedProjectId(null);
        setSelectedTaskId(null);
        navigate('/', { replace: true });
      }

      // Reset delete account related states when user changes
      setShowDeleteConfirm(false);
      setShowPasswordInput(false);
      setPassword('');
      setDeleteLoading(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    if (user) {
      // Load user's projects
      const loadProjects = async () => {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .order('created_at', { ascending: true });

        if (!error && data) {
          setProjects(data);
        }
      };

      loadProjects();
    }
  }, [user]);

  useEffect(() => {
    if (user && selectedProjectId) {
      // Load tasks for selected project
      const loadTasks = async () => {
        const { data, error } = await supabase
          .from('tasks')
          .select('*')
          .eq('project_id', selectedProjectId)
          .order('created_at', { ascending: true });

        if (!error && data) {
          setTasks(data);
        }
      };

      loadTasks();
    }
  }, [user, selectedProjectId]);

  useEffect(() => {
    if (user && selectedProjectId) {
      // Load time sessions for selected project
      const loadSessions = async () => {
        const { data, error } = await supabase
          .from('time_sessions')
          .select('*')
          .eq('project_id', selectedProjectId)
          .order('start_time', { ascending: false });

        if (!error && data) {
          setSessions(data);
        }
      };

      loadSessions();
    }
  }, [user, selectedProjectId]);

  const handleToggleTheme = () => {
    setTheme((currentTheme) => (currentTheme === 'dark' ? 'light' : 'dark'));
  };

  const handleAddProject = async ({ name }: { name: string }) => {
    if (!user) return;

    const newProject = {
      name,
      user_id: user.id,
    };

    const { data, error } = await supabase.from('projects').insert([newProject]).select().single();

    if (!error && data) {
      setProjects((prev) => [...prev, data]);
      toast.success('Project added');
    } else {
      toast.error('Failed to add project');
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const { error } = await supabase.from('projects').delete().eq('id', projectId);

    if (!error) {
      setProjects((prev) => prev.filter((project) => project.id !== projectId));
      toast.success('Project deleted');

      if (selectedProjectId === projectId) {
        setSelectedProjectId(null);
        setSelectedTaskId(null);
      }
    } else {
      toast.error('Failed to delete project');
    }
  };

  const handleAddTask = async ({
    name,
    projectId,
    status,
    priority,
    description,
    dueDate,
  }: {
    name: string;
    projectId: string;
    status: string;
    priority: string;
    description: string | null;
    dueDate: string | null;
  }) => {
    if (!user) return;

    const newTask = {
      name,
      project_id: projectId,
      user_id: user.id,
      status,
      priority,
      description,
      due_date: dueDate,
    };

    const { data, error } = await supabase.from('tasks').insert([newTask]).select().single();

    if (!error && data) {
      setTasks((prev) => [...prev, data]);
      toast.success('Task added');
    } else {
      toast.error('Failed to add task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const { error } = await supabase.from('tasks').delete().eq('id', taskId);

    if (!error) {
      setTasks((prev) => prev.filter((task) => task.id !== taskId));
      toast.success('Task deleted');

      if (selectedTaskId === taskId) {
        setSelectedTaskId(null);
      }
    } else {
      toast.error('Failed to delete task');
    }
  };

  const handleSaveSession = async ({
    startTime,
    endTime,
    duration,
  }: {
    startTime: string;
    endTime: string;
    duration: number;
  }) => {
    if (!user || !selectedTaskId) return;

    const task = tasks.find((t) => t.id === selectedTaskId);
    if (task) {
      const newSession = {
        task_id: selectedTaskId,
        project_id: task.project_id,
        user_id: user.id,
        start_time: startTime,
        end_time: endTime,
        duration,
      };

      const { data, error } = await supabase
        .from('time_sessions')
        .insert([newSession])
        .select()
        .single();

      if (!error && data) {
        setSessions((prev) => [data, ...prev]);
        toast.success('Session saved');
      } else {
        toast.error('Failed to save session');
      }
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    const { error } = await supabase.from('time_sessions').delete().eq('id', sessionId);

    if (!error) {
      setSessions((prev) => prev.filter((session) => session.id !== sessionId));
      toast.success('Session deleted');
    } else {
      toast.error('Failed to delete session');
    }
  };

  const handleSignOut = async () => {
    try {
      // Clear all auth data first
      clearAuthData();

      // Reset all application state
      setUser(null);
      setProjects([]);
      setTasks([]);
      setSessions([]);
      setSelectedProjectId(null);
      setSelectedTaskId(null);

      // Attempt to sign out from Supabase
      await supabase.auth.signOut();

      // Navigate to home and force a clean reload
      navigate('/', { replace: true });
      window.location.reload();
    } catch (error) {
      console.error('Error during sign out:', error);
      // Force a clean reload even if there's an error
      window.location.reload();
    }
  };

  const handleDeleteAccount = async () => {
    if (!user) return;

    if (!showPasswordInput) {
      setShowPasswordInput(true);
      return;
    }

    if (!password) {
      toast.error('Password is required to delete your account');
      return;
    }
    setDeleteLoading(true);

    try {
      // First verify the password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email || '',
        password: password,
      });

      if (signInError) {
        throw new Error('Incorrect password. Please try again.');
      }

      // Delete user data first (projects, tasks, and sessions will cascade delete due to RLS)
      const { error: deleteDataError } = await supabase
        .from('projects')
        .delete()
        .eq('user_id', user.id);

      if (deleteDataError) {
        throw new Error(`Failed to delete user data: ${deleteDataError.message}`);
      }

      // Delete the user account
      const { error: deleteUserError } = await supabase.auth.admin.deleteUser(user.id);

      if (deleteUserError) {
        // If admin API fails, try the alternative approach
        // This is a workaround since we can't directly delete users from client-side
        const { error: updateError } = await supabase.rpc('delete_user');

        if (updateError) {
          throw new Error(`Failed to delete account: ${updateError.message}`);
        }
      }

      // Sign out after successful deletion
      await handleSignOut();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'An unknown error occurred');
      setShowPasswordInput(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleUpdateTask = async (
    taskId: string,
    updates: {
      status?: string;
      priority?: string;
    }
  ) => {
    const currentTask = tasks.find((task) => task.id === taskId);

    const taskUpdates = {
      ...updates,
      ...(updates.status === 'done' && currentTask?.status !== 'done'
        ? { completed_at: new Date().toISOString() }
        : {}),
      ...(updates.status && updates.status !== 'done' ? { completed_at: null } : {}),
    };

    const { data, error } = await supabase
      .from('tasks')
      .update(taskUpdates)
      .eq('id', taskId)
      .select()
      .single();

    if (!error && data) {
      setTasks((prev) => prev.map((task) => (task.id === taskId ? data : task)));
      toast.success('Task updated');
    } else {
      toast.error('Failed to update task');
    }
  };

  const resetDeleteAccountStates = () => {
    setShowDeleteConfirm(false);
    setShowPasswordInput(false);
    setPassword('');
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
        <div className="text-2xl text-gray-600 dark:text-gray-300">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return <Auth />;
  }

  const selectedTask = selectedTaskId ? tasks.find((t) => t.id === selectedTaskId) : null;
  const taskProjectId = selectedTask?.project_id;
  const selectedProject = taskProjectId ? projects.find((p) => p.id === taskProjectId) : null;

  return (
    <div className="min-h-dvh overflow-x-hidden bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 text-gray-900 dark:from-gray-950 dark:via-slate-950 dark:to-indigo-950 dark:text-gray-100">
      <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 sm:py-8 lg:px-8">
        {/* Top ad with proper spacing */}
        <div className="mb-8 -mt-4">
          <AdSense position="top" />
        </div>

        <div className="mb-8 flex flex-col gap-4 rounded-2xl border border-white/60 bg-white/75 p-4 shadow-lg backdrop-blur dark:border-white/10 dark:bg-gray-900/70 sm:flex-row sm:items-center sm:justify-between">
          <h1 className="bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-3xl font-bold text-transparent dark:from-blue-300 dark:to-indigo-300">
            TickTrack
          </h1>
          <div className="flex flex-wrap gap-2">
            <ProfileDialog user={user} />

            <ThemeToggle theme={theme} onToggleTheme={handleToggleTheme} />
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 flex items-center gap-2"
              title="Delete Account"
            >
              <UserX className="w-5 h-5" />
              <span className="hidden md:inline">Delete Account</span>
            </button>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 rounded-md bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300 dark:bg-gray-800 dark:text-gray-100 dark:hover:bg-gray-700"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>
        <div className="mb-6 flex gap-2">
          <button
            type="button"
            onClick={() => setActiveView('dashboard')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${
              activeView === 'dashboard'
                ? 'bg-blue-600 text-white'
                : 'bg-white/80 text-gray-700 hover:bg-white dark:bg-gray-900/70 dark:text-gray-200 dark:hover:bg-gray-800'
            }`}
          >
            Dashboard
          </button>

          <button
            type="button"
            onClick={() => setActiveView('calendar')}
            className={`rounded-md px-4 py-2 text-sm font-medium transition ${
              activeView === 'calendar'
                ? 'bg-blue-600 text-white'
                : 'bg-white/80 text-gray-700 hover:bg-white dark:bg-gray-900/70 dark:text-gray-200 dark:hover:bg-gray-800'
            }`}
          >
            Calendar
          </button>
        </div>
        {activeView === 'dashboard' ? (
          <Dashboard
            projects={projects}
            tasks={tasks}
            sessions={sessions}
            selectedProjectId={selectedProjectId}
          />
        ) : (
          <CalendarView
            tasks={tasks}
            selectedProjectId={selectedProjectId}
            onSelectTask={setSelectedTaskId}
            onUpdateTask={handleUpdateTask}
          />
        )}
        <div className="grid grid-cols-1 gap-6 mb-8 lg:grid-cols-[320px_1fr]">
          <ProjectList
            projects={projects}
            onAddProject={handleAddProject}
            onSelectProject={setSelectedProjectId}
            onDeleteProject={handleDeleteProject}
            selectedProjectId={selectedProjectId}
          />
          <TaskList
            tasks={tasks}
            selectedProjectId={selectedProjectId}
            onAddTask={handleAddTask}
            onSelectTask={setSelectedTaskId}
            onDeleteTask={handleDeleteTask}
            selectedTaskId={selectedTaskId}
            onUpdateTask={handleUpdateTask}
          />
        </div>

        {selectedTaskId && taskProjectId && selectedTask && selectedProject && (
          <div className="mb-8 relative">
            <Timer
              projectName={selectedProject.name}
              taskName={selectedTask.name}
              onSaveSession={handleSaveSession}
            />
          </div>
        )}

        {/* Add padding at the bottom on mobile to account for the fixed ad */}
        <div className="pb-32 md:pb-0">
          <SessionList
            sessions={sessions}
            tasks={tasks}
            projects={projects}
            onDeleteSession={handleDeleteSession}
          />
        </div>

        {/* Bottom ad only shows on mobile */}
        <AdSense position="bottom" />
      </div>

      {/* Delete Account Confirmation Modal */}
      <AlertDialog open={showDeleteConfirm} onOpenChange={setShowDeleteConfirm}>
        <AlertDialogContent className="mx-4 max-w-md rounded-2xl border border-white/10 bg-white p-6 text-gray-900 shadow-2xl dark:bg-gray-950 dark:text-gray-100">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-xl font-bold text-gray-900 dark:text-gray-100">
              Delete Account
            </AlertDialogTitle>
            <AlertDialogDescription className="text-sm leading-6 text-gray-600 dark:text-gray-300">
              {!showPasswordInput
                ? 'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.'
                : 'To confirm account deletion, please enter your password.'}
            </AlertDialogDescription>
          </AlertDialogHeader>

          {showPasswordInput && (
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="mt-2 bg-white dark:bg-gray-900"
            />
          )}

          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={resetDeleteAccountStates}
              disabled={deleteLoading}
              className="border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-100 dark:hover:bg-gray-800"
            >
              Cancel
            </AlertDialogCancel>

            <AlertDialogAction
              onClick={(event) => {
                event.preventDefault();
                handleDeleteAccount();
              }}
              disabled={deleteLoading}
              className="bg-red-600 text-white hover:bg-red-700 focus:ring-red-600"
            >
              {deleteLoading
                ? 'Deleting...'
                : showPasswordInput
                  ? 'Confirm Delete'
                  : 'Delete Account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Toaster richColors position="top-right" />
    </div>
  );
}

export default App;
