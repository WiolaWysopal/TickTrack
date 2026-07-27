import { supabase } from './supabase';
import type { TaskActivityType } from '../types';

interface CreateTaskActivityParams {
  taskId: string;
  userId: string;
  activityType: TaskActivityType;
  description: string;
  metadata?: Record<string, string | number | boolean | null>;
}

export const createTaskActivity = async ({
  taskId,
  userId,
  activityType,
  description,
  metadata = {},
}: CreateTaskActivityParams) => {
  const { error } = await supabase.from('task_activity').insert({
    task_id: taskId,
    user_id: userId,
    activity_type: activityType,
    description,
    metadata,
  });

  if (error) {
    console.error('Failed to create task activity:', error);
  }

  return { error };
};
