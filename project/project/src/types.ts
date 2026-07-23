export interface Task {
  id: string;
  name: string;
  project_id: string;
  status: string;
  priority: string;
  description: string | null;
  due_date: string | null;
  completed_at: string | null;
  is_favorite: boolean;
}

export interface TaskComment {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string | null;
  author_display_name: string | null;
  author_avatar_url: string | null;
}

export interface Project {
  id: string;
  name: string;
  is_favorite: boolean;
}

export interface TimeSession {
  id: string;
  task_id: string;
  project_id: string;
  start_time: string;
  end_time: string | null;
  duration: number;
}

export interface Profile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}
