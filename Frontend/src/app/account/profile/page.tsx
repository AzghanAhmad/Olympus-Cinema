'use client';

import React, { useState } from 'react';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { useAuthStore } from '@/store/useAuthStore';
import { toast } from '@/store/useToastStore';
import { apiFetch, ApiSuccess } from '@/lib/api';
import { PasswordInput } from '@/components/ui/PasswordInput';
import { Save, Lock } from 'lucide-react';

const passwordFieldClass =
  'w-full py-2.5 px-3 pr-11 bg-secondary text-foreground text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary';

export default function UserProfilePage() {
  const { user, refreshProfile, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const parts = name.trim().split(/\s+/);
    const firstName = parts[0] || 'Guest';
    const lastName = parts.slice(1).join(' ') || 'User';
    setSavingProfile(true);
    try {
      await apiFetch<ApiSuccess<unknown>>('/users/me', {
        method: 'PATCH',
        body: JSON.stringify({ firstName, lastName, phone }),
      });
      updateUser({ name, phone });
      await refreshProfile();
      toast.success('Profile updated', 'Your contact details were saved.');
    } catch (err) {
      toast.error('Could not save profile', err instanceof Error ? err.message : 'Try again');
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmNewPassword) {
      toast.error('Passwords do not match', 'Enter the same new password in both fields.');
      return;
    }
    setSavingPassword(true);
    try {
      await apiFetch<ApiSuccess<unknown>>('/users/me/password', {
        method: 'PATCH',
        body: JSON.stringify({
          currentPassword,
          newPassword,
          confirmNewPassword,
        }),
      });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmNewPassword('');
      toast.success('Password updated', 'Use your new password next time you sign in.');
    } catch (err) {
      toast.error('Could not update password', err instanceof Error ? err.message : 'Try again');
    } finally {
      setSavingPassword(false);
    }
  };

  return (
    <PublicLayout>
      <div className="max-w-2xl mx-auto px-4 py-12 space-y-8">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Edit Profile & Account</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage your contact credentials and password.</p>
        </div>

        <form onSubmit={handleSave} className="p-8 bg-card border border-border rounded-3xl space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full py-2.5 px-3 bg-secondary text-foreground text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Email Address</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full py-2.5 px-3 bg-secondary text-muted-foreground text-sm rounded-xl border border-border"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold mb-1">Phone Number</label>
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full py-2.5 px-3 bg-secondary text-foreground text-sm rounded-xl border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-border flex justify-end">
            <button
              type="submit"
              disabled={savingProfile}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/30 disabled:opacity-60"
            >
              <Save className="w-4 h-4" />
              {savingProfile ? 'Saving...' : 'Save Profile Changes'}
            </button>
          </div>
        </form>

        <form onSubmit={handlePasswordSave} className="p-8 bg-card border border-border rounded-3xl space-y-6">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-primary" />
            <h2 className="text-lg font-extrabold tracking-tight">Change password</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-semibold mb-1">Current password</label>
              <PasswordInput
                name="currentPassword"
                required
                minLength={8}
                autoComplete="current-password"
                value={currentPassword}
                onChange={setCurrentPassword}
                className={passwordFieldClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">New password</label>
              <PasswordInput
                name="newPassword"
                required
                minLength={8}
                autoComplete="new-password"
                value={newPassword}
                onChange={setNewPassword}
                placeholder="At least 8 characters"
                className={passwordFieldClass}
              />
            </div>
            <div>
              <label className="block text-xs font-semibold mb-1">Confirm new password</label>
              <PasswordInput
                name="confirmNewPassword"
                required
                minLength={8}
                autoComplete="new-password"
                value={confirmNewPassword}
                onChange={setConfirmNewPassword}
                placeholder="Re-enter your new password"
                className={passwordFieldClass}
              />
              {confirmNewPassword.length > 0 && newPassword !== confirmNewPassword && (
                <p className="mt-1 text-[11px] font-semibold text-destructive">
                  Passwords do not match
                </p>
              )}
            </div>
          </div>
          <div className="pt-4 border-t border-border flex justify-end">
            <button
              type="submit"
              disabled={savingPassword || newPassword !== confirmNewPassword}
              className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold text-xs rounded-xl hover:bg-primary/90 shadow-lg shadow-primary/30 disabled:opacity-60"
            >
              <Lock className="w-4 h-4" />
              {savingPassword ? 'Updating...' : 'Update password'}
            </button>
          </div>
        </form>
      </div>
    </PublicLayout>
  );
}
