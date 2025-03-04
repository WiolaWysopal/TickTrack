export interface Task {
  id: string;
  name: string;
  project_id: string;
}

export interface Project {
  id: string;
  name: string;
}

export interface TimeSession {
  id: string;
  task_id: string;
  project_id: string;
  start_time: string;
  end_time: string | null;
  duration: number;
}