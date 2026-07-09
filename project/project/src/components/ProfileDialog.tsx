import { useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { ImagePlus, Save, Trash2, UserCircle } from 'lucide-react';
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

const AVATAR_BUCKET = 'avatars';
const MAX_AVATAR_SIZE_MB = 2;
const MAX_AVATAR_SIZE_BYTES = MAX_AVATAR_SIZE_MB * 1024 * 1024;
const ALLOWED_AVATAR_TYPES = ['image/jpeg', 'image/png', 'image/webp'];

interface ProfileDialogProps {
  user: User;
}

export function ProfileDialog({ user }: ProfileDialogProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [displayName, setDisplayName] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [avatarDeleting, setAvatarDeleting] = useState(false);

  const avatarUrl = profile?.avatar_url;

  useEffect(() => {
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
  }, [user.id]);

  const updateProfile = async (updates: Partial<Pick<Profile, 'display_name' | 'avatar_url'>>) => {
    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    setProfile(data);
    setDisplayName(data.display_name ?? '');
  };

  const getAvatarPathFromUrl = (url: string) => {
    const marker = `/${AVATAR_BUCKET}/`;
    const markerIndex = url.indexOf(marker);

    if (markerIndex === -1) {
      return null;
    }

    return url.slice(markerIndex + marker.length).split('?')[0];
  };

  const handleAvatarUpload = async (file: File) => {
    if (!ALLOWED_AVATAR_TYPES.includes(file.type)) {
      toast.error('Avatar must be a JPG, PNG or WEBP image');
      return;
    }

    if (file.size > MAX_AVATAR_SIZE_BYTES) {
      toast.error(`Avatar must be smaller than ${MAX_AVATAR_SIZE_MB} MB`);
      return;
    }

    setAvatarUploading(true);

    try {
      const fileExtension = file.name.split('.').pop()?.toLowerCase() || 'png';
      const avatarPath = `${user.id}/avatar.${fileExtension}`;

      const { error: uploadError } = await supabase.storage
        .from(AVATAR_BUCKET)
        .upload(avatarPath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(avatarPath);

      const avatarUrlWithCacheBust = `${publicUrl}?v=${Date.now()}`;

      await updateProfile({
        avatar_url: avatarUrlWithCacheBust,
      });

      toast.success('Avatar updated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to upload avatar');
    } finally {
      setAvatarUploading(false);

      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAvatarDelete = async () => {
    if (!avatarUrl) return;

    setAvatarDeleting(true);

    try {
      const avatarPath = getAvatarPathFromUrl(avatarUrl);

      if (avatarPath) {
        const { error: removeError } = await supabase.storage
          .from(AVATAR_BUCKET)
          .remove([avatarPath]);

        if (removeError) {
          throw removeError;
        }
      }

      await updateProfile({
        avatar_url: null,
      });

      toast.success('Avatar removed');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to remove avatar');
    } finally {
      setAvatarDeleting(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);

    try {
      const trimmedDisplayName = displayName.trim();

      await updateProfile({
        display_name: trimmedDisplayName || null,
      });

      toast.success('Profile updated');
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
    } finally {
      setSaving(false);
    }
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
          <span className="flex h-5 w-5 items-center justify-center overflow-hidden rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-white">
            {avatarUrl ? (
              <img src={avatarUrl} alt="User avatar" className="h-full w-full object-cover" />
            ) : (
              <UserCircle className="h-5 w-5" />
            )}
          </span>

          <span className="hidden md:inline">Profile</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="left-1/2 top-1/2 max-h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 overflow-y-auto rounded-2xl border border-white/60 bg-white/95 p-6 text-gray-900 shadow-2xl backdrop-blur dark:border-white/10 dark:bg-gray-950/95 dark:text-gray-100 sm:w-full">
        <DialogHeader>
          <div className="mb-2 flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg">
              {avatarUrl ? (
                <img src={avatarUrl} alt="User avatar" className="h-full w-full object-cover" />
              ) : (
                <UserCircle className="h-9 w-9" />
              )}
            </div>

            <div>
              <DialogTitle className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                User Profile
              </DialogTitle>

              <DialogDescription className="text-sm leading-6 text-gray-600 dark:text-gray-300">
                Manage your basic TickTrack profile information.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="mt-4 space-y-5">
          <div className="rounded-2xl border border-gray-200 bg-gray-50/80 p-4 dark:border-gray-800 dark:bg-gray-900/70">
            <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">
              Avatar
            </p>

            <div className="flex flex-col gap-3 sm:flex-row">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(event) => {
                  const file = event.target.files?.[0];

                  if (file) {
                    handleAvatarUpload(file);
                  }
                }}
              />

              <Button
                type="button"
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={loading || avatarUploading || avatarDeleting}
                className="w-full border-gray-300 bg-white text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-950 dark:text-gray-100 dark:hover:bg-gray-800 sm:w-auto"
              >
                <ImagePlus className="mr-2 h-4 w-4" />
                {avatarUploading ? 'Uploading...' : avatarUrl ? 'Change avatar' : 'Upload avatar'}
              </Button>

              {avatarUrl && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleAvatarDelete}
                  disabled={loading || avatarUploading || avatarDeleting}
                  className="w-full border-red-200 bg-white text-red-600 hover:bg-red-50 dark:border-red-900/60 dark:bg-gray-950 dark:text-red-400 dark:hover:bg-red-950/30 sm:w-auto"
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  {avatarDeleting ? 'Removing...' : 'Remove'}
                </Button>
              )}
            </div>

            <p className="mt-3 text-xs text-gray-500 dark:text-gray-400">
              JPG, PNG or WEBP. Max {MAX_AVATAR_SIZE_MB} MB.
            </p>
          </div>

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
            {saving ? 'Saving...' : 'Save display name'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
