import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { UserCircle, Save } from 'lucide-react';
import { toast } from 'sonner';

import { supabase } from '../lib/supabase';
import type { Profile } from '../types';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

interface ProfileDialogProps {
  user: User;
}

export function ProfileDialog({ user }: ProfileDialogProps) {
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;

    const loadProfile = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) {
        toast.error('Failed to load profile');
      }

      if (data) {
        setProfile(data);
        setDisplayName(data.display_name ?? '');
      }

      setLoading(false);
    };

    loadProfile();
  }, [open, user.id]);

  const handleSave = async () => {
    setSaving(true);

    const trimmedDisplayName = displayName.trim();

    const { data, error } = await supabase
      .from('profiles')
      .update({
        display_name: trimmedDisplayName || null,
      })
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      toast.error('Failed to update profile');
      setSaving(false);
      return;
    }

    setProfile(data);
    setDisplayName(data.display_name ?? '');
    toast.success('Profile updated');
    setSaving(false);
  };

  const formattedCreatedAt = user.created_at
    ? new Intl.DateTimeFormat('en', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(new Date(user.created_at))
    : 'Unknown';

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="flex h-10 items-center gap-2 rounded-md border-gray-300 bg-white/80 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-900/80 dark:text-gray-100 dark:hover:bg-gray-800"
          title="Profile"
        >
          <UserCircle className="h-5 w-5" />
          <span className="hidden md:inline">Profile</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="left-1/2 top-1/2 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/60 bg-white/95 p-6 text-gray-900 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-gray-950/95 dark:text-gray-100 sm:w-full">
        <DialogHeader>
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
            <UserCircle className="h-7 w-7" />
          </div>

          <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            User Profile
          </DialogTitle>

          <DialogDescription className="text-sm leading-6 text-gray-600 dark:text-gray-300">
            Manage your basic TickTrack profile information.
          </DialogDescription>
        </DialogHeader>

        <div className="mt-4 space-y-5">
          <div className="space-y-2">
            <label
              htmlFor="displayName"
              className="text-sm font-medium text-gray-700 dark:text-gray-200"
            >
              Display name
            </label>
            <Input
              id="displayName"
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
              placeholder="Enter your display name"
              disabled={loading || saving}
              className="bg-white dark:bg-gray-900"
            />
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-900/70">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Email
            </p>
            <p className="mt-1 break-all text-sm font-medium text-gray-900 dark:text-gray-100">
              {user.email}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-900/70">
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Account created
            </p>
            <p className="mt-1 text-sm font-medium text-gray-900 dark:text-gray-100">
              {formattedCreatedAt}
            </p>
          </div>

          <Button
            onClick={handleSave}
            disabled={loading || saving || displayName.trim() === (profile?.display_name ?? '')}
            className="w-full bg-blue-600 text-white hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? 'Saving...' : 'Save profile'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
