'use client';

import React, { useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Save } from 'lucide-react';
import { toast } from '@/store/useToastStore';
import { adminApi } from '@/services/adminApi';

export default function AdminSettingsPage() {
  const qc = useQueryClient();
  const { data, isLoading, error } = useQuery({
    queryKey: ['admin', 'settings'],
    queryFn: () => adminApi.settings.get(),
  });
  const settings = data?.data ?? {};

  const [cinemaName, setCinemaName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [address, setAddress] = useState('');
  const [maxTickets, setMaxTickets] = useState('15');
  const [seatHold, setSeatHold] = useState('10');

  useEffect(() => {
    if (!data?.data) return;
    const s = data.data;
    setCinemaName(String(s.cinemaName ?? s.siteName ?? ''));
    setContactEmail(String(s.contactEmail ?? ''));
    setContactPhone(String(s.contactPhone ?? ''));
    setAddress(String(s.address ?? ''));
    setMaxTickets(String(s.maxTicketsPerPerson ?? 15));
    setSeatHold(String(s.seatHoldDuration ?? 10));
  }, [data]);

  const saveMutation = useMutation({
    mutationFn: () =>
      adminApi.settings.update({
        cinemaName,
        siteName: cinemaName,
        contactEmail,
        contactPhone,
        address,
        maxTicketsPerPerson: Number(maxTickets),
        seatHoldDuration: Number(seatHold),
      }),
    onSuccess: () => {
      toast.success('Settings saved');
      qc.invalidateQueries({ queryKey: ['admin', 'settings'] });
    },
    onError: (e: Error) => toast.error('Save failed', e.message),
  });

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold tracking-tight">Settings</h1>
        <p className="text-xs text-muted-foreground mt-1">Persisted in the database via the API.</p>
      </div>
      {isLoading && <p className="text-sm text-muted-foreground">Loading…</p>}
      {error && <p className="text-sm text-rose-500">{(error as Error).message}</p>}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          saveMutation.mutate();
        }}
        className="p-8 bg-card border border-border rounded-3xl space-y-4"
      >
        <Field label="Cinema name" value={cinemaName} onChange={setCinemaName} />
        <Field label="Contact email" value={contactEmail} onChange={setContactEmail} />
        <Field label="Contact phone" value={contactPhone} onChange={setContactPhone} />
        <Field label="Address" value={address} onChange={setAddress} />
        <Field label="Max tickets per person" value={maxTickets} onChange={setMaxTickets} type="number" />
        <Field label="Seat hold minutes" value={seatHold} onChange={setSeatHold} type="number" />
        <div className="pt-2 flex justify-end">
          <button type="submit" className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-white text-xs font-bold rounded-xl">
            <Save className="w-4 h-4" />
            {saveMutation.isPending ? 'Saving…' : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = 'text',
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="block text-xs font-semibold mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full py-2.5 px-3 bg-secondary text-sm rounded-xl border border-border"
      />
    </div>
  );
}
