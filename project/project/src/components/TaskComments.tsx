import { useCallback, useEffect, useState } from 'react';
import { MessageSquare, Send, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

import { supabase } from '../lib/supabase';
import type { TaskComment } from '../types';

import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface TaskCommentsProps {
  taskId: string;
}

const MAX_COMMENT_LENGTH = 2000;

const formatCommentDate = (date: string) => {
  return new Intl.DateTimeFormat('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(date));
};

export function TaskComments({ taskId }: TaskCommentsProps) {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);

  const loadComments = useCallback(async () => {
    setLoading(true);

    const { data, error } = await supabase
      .from('task_comments')
      .select('*')
      .eq('task_id', taskId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Failed to load task comments:', error);
      toast.error('Failed to load comments');
      setComments([]);
    } else {
      setComments((data ?? []) as TaskComment[]);
    }

    setLoading(false);
  }, [taskId]);

  useEffect(() => {
    const loadCurrentUser = async () => {
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser();

      if (error) {
        console.error('Failed to load current user:', error);
        return;
      }

      setCurrentUserId(user?.id ?? null);
    };

    loadCurrentUser();
    loadComments();
  }, [loadComments]);

  const handleAddComment = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const content = newComment.trim();

    if (!content) {
      toast.error('Comment cannot be empty');
      return;
    }

    if (content.length > MAX_COMMENT_LENGTH) {
      toast.error(`Comment cannot exceed ${MAX_COMMENT_LENGTH} characters`);
      return;
    }

    if (!currentUserId) {
      toast.error('You must be signed in to add a comment');
      return;
    }

    setSubmitting(true);

    const { data, error } = await supabase
      .from('task_comments')
      .insert({
        task_id: taskId,
        user_id: currentUserId,
        content,
      })
      .select()
      .single();

    if (error) {
      console.error('Failed to add task comment:', error);
      toast.error('Failed to add comment');
    } else {
      setComments((currentComments) => [data as TaskComment, ...currentComments]);
      setNewComment('');
      toast.success('Comment added');
    }

    setSubmitting(false);
  };

  const handleDeleteComment = async (commentId: string) => {
    setDeletingCommentId(commentId);

    const { error } = await supabase
      .from('task_comments')
      .delete()
      .eq('id', commentId)
      .eq('task_id', taskId);

    if (error) {
      console.error('Failed to delete task comment:', error);
      toast.error('Failed to delete comment');
    } else {
      setComments((currentComments) =>
        currentComments.filter((comment) => comment.id !== commentId)
      );

      toast.success('Comment deleted');
    }

    setDeletingCommentId(null);
  };

  return (
    <section className="mt-6 border-t border-gray-200 pt-6 dark:border-gray-700">
      <div className="mb-4 flex items-center gap-2">
        <MessageSquare className="h-5 w-5 text-blue-600 dark:text-blue-400" />

        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Comments</h3>

        <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600 dark:bg-gray-800 dark:text-gray-300">
          {comments.length}
        </span>
      </div>

      <form onSubmit={handleAddComment} className="mb-6 space-y-2">
        <Textarea
          value={newComment}
          onChange={(event) => setNewComment(event.target.value)}
          placeholder="Write a comment..."
          maxLength={MAX_COMMENT_LENGTH}
          disabled={submitting}
          className="min-h-24 resize-y bg-white dark:bg-gray-900"
        />

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {newComment.length}/{MAX_COMMENT_LENGTH}
          </span>

          <Button
            type="submit"
            disabled={submitting || !newComment.trim()}
            className="w-full sm:w-auto"
          >
            <Send className="mr-2 h-4 w-4" />
            {submitting ? 'Adding...' : 'Add comment'}
          </Button>
        </div>
      </form>

      {loading ? (
        <p className="py-4 text-sm text-gray-500 dark:text-gray-400">Loading comments...</p>
      ) : comments.length === 0 ? (
        <div className="rounded-lg border border-dashed border-gray-300 px-4 py-6 text-center dark:border-gray-700">
          <MessageSquare className="mx-auto mb-2 h-8 w-8 text-gray-400" />

          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">No comments yet</p>

          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Add the first comment about this task.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {comments.map((comment) => {
            const canDelete = comment.user_id === currentUserId;
            const isDeleting = deletingCommentId === comment.id;

            return (
              <li
                key={comment.id}
                className="rounded-lg border border-gray-200 bg-white/70 p-4 dark:border-gray-700 dark:bg-gray-900/60"
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">You</p>

                    <time
                      dateTime={comment.created_at}
                      className="text-xs text-gray-500 dark:text-gray-400"
                    >
                      {formatCommentDate(comment.created_at)}
                    </time>
                  </div>

                  {canDelete && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      disabled={isDeleting}
                      onClick={() => handleDeleteComment(comment.id)}
                      aria-label="Delete comment"
                      title="Delete comment"
                      className="h-8 w-8 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>

                <p className="whitespace-pre-wrap break-words text-sm leading-6 text-gray-700 dark:text-gray-300">
                  {comment.content}
                </p>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
