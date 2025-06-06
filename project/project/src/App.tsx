import { useState, useEffect } from 'react';
import { Timer } from './components/Timer';
import { ProjectList } from './components/ProjectList';
import { TaskList } from './components/TaskList';
import { SessionList } from './components/SessionList';
import { Auth } from './components/Auth';
import { AdSense } from './components/AdSense';
import { supabase, clearAuthData } from './lib/supabase';
import type { Project, Task, TimeSession } from './types';
import type { User } from '@supabase/supabase-js';
import { LogOut, UserX } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Check current auth status
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
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
      setDeleteError(null);
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

  const handleAddProject = async ({ name }: { name: string }) => {
    if (!user) return;

    const newProject = {
      name,
      user_id: user.id
    };

    const { data, error } = await supabase
      .from('projects')
      .insert([newProject])
      .select()
      .single();

    if (!error && data) {
      setProjects((prev) => [...prev, data]);
    }
  };

  const handleDeleteProject = async (projectId: string) => {
    const { error } = await supabase
      .from('projects')
      .delete()
      .eq('id', projectId);

    if (!error) {
      setProjects(prev => prev.filter(project => project.id !== projectId));
      if (selectedProjectId === projectId) {
        setSelectedProjectId(null);
        setSelectedTaskId(null);
      }
    }
  };

  const handleAddTask = async ({ name, projectId }: { name: string; projectId: string }) => {
    if (!user) return;

    const newTask = {
      name,
      project_id: projectId,
      user_id: user.id
    };

    const { data, error } = await supabase
      .from('tasks')
      .insert([newTask])
      .select()
      .single();

    if (!error && data) {
      setTasks((prev) => [...prev, data]);
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    const { error } = await supabase
      .from('tasks')
      .delete()
      .eq('id', taskId);

    if (!error) {
      setTasks(prev => prev.filter(task => task.id !== taskId));
      if (selectedTaskId === taskId) {
        setSelectedTaskId(null);
      }
    }
  };

  const handleSaveSession = async ({ startTime, endTime, duration }: { startTime: string; endTime: string; duration: number }) => {
    if (!user || !selectedTaskId) return;

    const task = tasks.find(t => t.id === selectedTaskId);
    if (task) {
      const newSession = {
        task_id: selectedTaskId,
        project_id: task.project_id,
        user_id: user.id,
        start_time: startTime,
        end_time: endTime,
        duration
      };

      const { data, error } = await supabase
        .from('time_sessions')
        .insert([newSession])
        .select()
        .single();

      if (!error && data) {
        setSessions((prev) => [data, ...prev]);
      }
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    const { error } = await supabase
      .from('time_sessions')
      .delete()
      .eq('id', sessionId);

    if (!error) {
      setSessions(prev => prev.filter(session => session.id !== sessionId));
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
      setDeleteError("Password is required to delete your account");
      return;
    }
    
    setDeleteLoading(true);
    setDeleteError(null);
    
    try {
      // First verify the password by attempting to sign in
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email || '',
        password: password
      });
      
      if (signInError) {
        throw new Error("Incorrect password. Please try again.");
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
      setDeleteError(error instanceof Error ? error.message : 'An unknown error occurred');
      setShowPasswordInput(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  const resetDeleteAccountStates = () => {
    setShowDeleteConfirm(false);
    setShowPasswordInput(false);
    setPassword('');
    setDeleteError(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-2xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-100 flex flex-col">
        <div className="flex-grow">
          <Auth />
        </div>
        <AdSense position="bottom" className="mt-auto" />
      </div>
    );
  }

  const selectedTask = selectedTaskId ? tasks.find(t => t.id === selectedTaskId) : null;
  const taskProjectId = selectedTask?.project_id;
  const selectedProject = taskProjectId ? projects.find(p => p.id === taskProjectId) : null;

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* Top ad with proper spacing */}
        <div className="mb-8 -mt-4">
          <AdSense position="top" />
        </div>

        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">TickTrack</h1>
          <div className="flex space-x-2">
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
              className="bg-gray-200 text-gray-700 px-4 py-2 rounded-md hover:bg-gray-300 flex items-center gap-2"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden md:inline">Sign Out</span>
            </button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
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
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4">Delete Account</h3>
            
            {!showPasswordInput ? (
              <p className="mb-6">
                Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.
              </p>
            ) : (
              <div className="mb-6">
                <p className="mb-4">
                  To confirm account deletion, please enter your password:
                </p>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full px-3 py-2 border rounded-md"
                />
              </div>
            )}
            
            {deleteError && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                {deleteError}
              </div>
            )}
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={resetDeleteAccountStates}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                disabled={deleteLoading}
              >
                Cancel
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Deleting...' : showPasswordInput ? 'Confirm Delete' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;