'use client';

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Search } from 'lucide-react';
import { toast } from '@/store/useToastStore';
import { adminApi } from '@/services/adminApi';
import { formatDate } from '@/lib/utils';

export default function AdminUsersPage() {
  const qc = useQueryClient();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState('');
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'users', search],
    queryFn: () => adminApi.users.list(search || undefined),
  });
  const users = data?.data ?? [];

  useEffect(() => {
    const q = searchParams.get('q') || '';
    setSearch(q);
  }, [searchParams]);

  const statusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      adminApi.users.updateStatus(id, status),
    onSuccess: () => {
      toast.success('User status updated');
      qc.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (e: Error) => toast.error('Update failed', e.message),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Users</h1>
        <p className="text-xs text-muted-foreground mt-1">Accounts from PostgreSQL.</p>
      </div>
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or email..."
          className="w-full pl-9 pr-4 py-2 bg-card text-xs rounded-xl border border-border"
        />
      </div>
      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {error && <p className="text-sm text-rose-500">{(error as Error).message}</p>}

      <div className="bg-card border border-border rounded-2xl overflow-hidden">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-border bg-secondary/40 text-[11px] uppercase font-bold text-muted-foreground">
              <th className="p-4">User</th>
              <th className="p-4">Role</th>
              <th className="p-4">Status</th>
              <th className="p-4">Joined</th>
              <th className="p-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {users.map((usr) => (
              <tr key={usr.id}>
                <td className="p-4">
                  <strong className="block">{usr.firstName} {usr.lastName}</strong>
                  <span className="text-[10px] text-muted-foreground">{usr.email}</span>
                </td>
                <td className="p-4 font-bold">{usr.role}</td>
                <td className="p-4">{usr.status}</td>
                <td className="p-4 text-muted-foreground">{formatDate(usr.createdAt)}</td>
                <td className="p-4 text-right">
                  <select
                    value={usr.status}
                    onChange={(e) => statusMutation.mutate({ id: usr.id, status: e.target.value })}
                    className="py-1 px-2 bg-secondary text-[11px] rounded-lg border border-border"
                  >
                    <option value="ACTIVE">ACTIVE</option>
                    <option value="INACTIVE">INACTIVE</option>
                    <option value="SUSPENDED">SUSPENDED</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
