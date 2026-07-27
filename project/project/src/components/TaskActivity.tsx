import { useCallback, useEffect, useState } from 'react';
import {
  Activity,
  CheckCircle2,
  PlusCircle,
  Clock3,
  Flag,
  Loader2,
  MessageSquare,
  Paperclip,
  Star,
  StarOff,
  Trash2,
} from 'lucide-react';

import { supabase } from '../lib/supabase';
import type { TaskActivity as TaskActivityItem, TaskActivityType } from '../types';

interface TaskActivityProps {
  taskId: string;
  refreshKey?: number;
}

const formatActivityDate = (date: string) =>
  new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));

const formatValue = (value: unknown) => {
  if (typeof value !== 'string') return value;

  return value.replace(/_/g, ' ').replace(/\b\w/g, (character: string) => character.toUpperCase());
};

const getActivityIcon = (activityType: TaskActivityType) => {
  switch (activityType) {
    case 'task_created':
      return PlusCircle;
    case 'status_changed':
      return CheckCircle2;
    case 'priority_changed':
      return Flag;
    case 'favorite_added':
      return Star;
    case 'favorite_removed':
      return StarOff;
    case 'comment_added':
      return MessageSquare;
    case 'comment_deleted':
      return Trash2;
    case 'file_uploaded':
      return Paperclip;
    case 'file_deleted':
      return Trash2;
    case 'time_session_added':
      return Clock3;
    default:
      return Activity;
  }
};

const getActivityDetails = (activity: TaskActivityItem) => {
  if (
    activity.activity_type === 'status_changed' ||
    activity.activity_type === 'priority_changed'
  ) {
    return `${formatValue(activity.metadata.old_value)} → ${formatValue(
      activity.metadata.new_value
    )}`;
  }

  if (
    activity.activity_type === 'time_session_added' &&
    typeof activity.metadata.duration === 'number'
  ) {
    const minutes = Math.floor(activity.metadata.duration / 60);
    const seconds = activity.metadata.duration % 60;

    return `${minutes}m ${seconds}s`;
  }

  return null;
};

export function TaskActivity({ taskId, refreshKey = 0 }: TaskActivityProps) {
  const [activities, setActivities] = useState<TaskActivityItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState('');

  const loadActivities = useCallback(async () => {
    setLoading(true);
    setErrorMessage('');

    const { data, error } = await supabase
      .from('task_activity')
      .select('id, task_id, user_id, activity_type, description, metadata, created_at')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load task activity:', error);
      setErrorMessage('Failed to load task activity.');
      setActivities([]);
    } else {
      setActivities((data ?? []) as TaskActivityItem[]);
    }

    setLoading(false);
  }, [taskId]);

  useEffect(() => {
    void loadActivities();
  }, [loadActivities, refreshKey]);

  return (
    <section className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
      <div className="mb-4 flex items-center gap-2">
        <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />

        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Activity</h3>

        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
          {activities.length}
        </span>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 py-4 text-sm text-gray-500 dark:text-gray-400">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading activity...
        </div>
      ) : errorMessage ? (
        <p className="text-sm text-red-600 dark:text-red-400">{errorMessage}</p>
      ) : activities.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 px-4 py-6 text-center dark:border-gray-700">
          <Activity className="mx-auto mb-2 h-8 w-8 text-gray-400" />

          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No activity yet</p>
        </div>
      ) : (
        <ul className="space-y-0">
          {activities.map((activity, index) => {
            const Icon = getActivityIcon(activity.activity_type);
            const details = getActivityDetails(activity);
            const isLast = index === activities.length - 1;

            return (
              <li key={activity.id} className="relative flex gap-3 pb-5">
                {!isLast && (
                  <span className="absolute left-4 top-8 h-full w-px bg-gray-200 dark:bg-gray-700" />
                )}

                <div className="relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-950 dark:text-blue-300">
                  <Icon className="h-4 w-4" />
                </div>

                <div className="min-w-0 pt-0.5">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                    {activity.description}
                  </p>

                  {details && (
                    <p className="mt-1 text-xs font-medium text-gray-600 dark:text-gray-300">
                      {details}
                    </p>
                  )}

                  <time
                    dateTime={activity.created_at}
                    className="mt-1 block text-xs text-gray-500 dark:text-gray-400"
                  >
                    {formatActivityDate(activity.created_at)}
                  </time>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
