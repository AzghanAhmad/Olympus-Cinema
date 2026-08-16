'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Minus, Plus, Save, Trash2, X } from 'lucide-react';
import {
  countSeatsInRows,
  createDefaultScreen,
  useCinemaLayoutStore,
} from '@/store/useCinemaLayoutStore';
import { generateSeatsFromScreen, getAisleAfter } from '@/data/seats';
import { CinemaScreen, SeatRowLayout } from '@/types/cinemaLayout';
import { CinemaHall, Seat, SeatCategory } from '@/types/screening';
import { toast } from '@/store/useToastStore';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';

const SCREEN_TYPES: CinemaHall['screenType'][] = [
  'STANDARD 4K',
  'DOLBY ATMOS',
  'IMAX 3D',
  'VIP SUITE',
];

function cloneScreen(screen: CinemaScreen): CinemaScreen {
  return {
    ...screen,
    rows: screen.rows.map((r) => ({ ...r })),
    seatMeta: { ...screen.seatMeta },
  };
}

function remappedMeta(
  meta: CinemaScreen['seatMeta'],
  oldLabel: string,
  newLabel: string
): CinemaScreen['seatMeta'] {
  const next: CinemaScreen['seatMeta'] = {};
  for (const [key, value] of Object.entries(meta)) {
    if (key.startsWith(`${oldLabel}-`)) {
      next[`${newLabel}-${key.slice(oldLabel.length + 1)}`] = value;
    } else {
      next[key] = value;
    }
  }
  return next;
}

function pruneMeta(screen: CinemaScreen): CinemaScreen['seatMeta'] {
  const valid = new Set<string>();
  screen.rows.forEach((row) => {
    const total = row.left + row.right;
    for (let n = 1; n <= total; n++) valid.add(`${row.label}-${n}`);
  });
  const next: CinemaScreen['seatMeta'] = {};
  for (const [key, value] of Object.entries(screen.seatMeta)) {
    if (valid.has(key)) next[key] = value;
  }
  return next;
}

function nextRowLabel(rows: SeatRowLayout[]): string {
  const used = new Set(rows.map((r) => r.label.toUpperCase()));
  for (let i = 0; i < 26; i++) {
    const letter = String.fromCharCode(65 + i);
    if (!used.has(letter)) return letter;
  }
  return `R${rows.length + 1}`;
}

export default function AdminScreensPage() {
  const screens = useCinemaLayoutStore((s) => s.screens);
  const saveScreen = useCinemaLayoutStore((s) => s.saveScreen);
  const addScreen = useCinemaLayoutStore((s) => s.addScreen);
  const removeScreen = useCinemaLayoutStore((s) => s.removeScreen);
  const setTotalSeats = useSiteSettingsStore((s) => s.setTotalSeats);

  const [selectedId, setSelectedId] = useState(screens[0]?.id || '');
  const [draft, setDraft] = useState<CinemaScreen | null>(null);
  const [dirty, setDirty] = useState(false);
  const [editMode, setEditMode] = useState<'toggle' | 'delete'>('toggle');
  const [showAddModal, setShowAddModal] = useState(false);
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<CinemaHall['screenType']>('STANDARD 4K');

  useEffect(() => {
    if (!selectedId && screens[0]) setSelectedId(screens[0].id);
  }, [screens, selectedId]);

  useEffect(() => {
    const source = screens.find((s) => s.id === selectedId);
    if (source) {
      setDraft(cloneScreen(source));
      setDirty(false);
    } else if (screens[0]) {
      setSelectedId(screens[0].id);
    } else {
      setDraft(null);
    }
  }, [selectedId, screens]);

  const seats: Seat[] = useMemo(() => {
    if (!draft) return [];
    return generateSeatsFromScreen(draft, 15, true);
  }, [draft]);

  const updateDraft = (updater: (prev: CinemaScreen) => CinemaScreen) => {
    setDraft((prev) => (prev ? updater(prev) : prev));
    setDirty(true);
  };

  const handleSelectScreen = (id: string) => {
    if (dirty && !window.confirm('Discard unsaved changes for this screen?')) return;
    setSelectedId(id);
  };

  const handleSave = () => {
    if (!draft) return;
    const cleaned: CinemaScreen = {
      ...draft,
      name: draft.name.trim() || 'Cinema Screen',
      seatMeta: pruneMeta(draft),
    };
    saveScreen(cleaned);
    setTotalSeats(countSeatsInRows(cleaned.rows));
    setDraft(cloneScreen(cleaned));
    setDirty(false);
    toast.success('Screen saved', 'Seat map is live on the booking page.');
  };

  const handleAddScreen = (e: React.FormEvent) => {
    e.preventDefault();
    const name = newName.trim() || `Screen ${screens.length + 1}`;
    const id = `hall-${Date.now()}`;
    const screen = createDefaultScreen(id, name, newType);
    addScreen(screen);
    setShowAddModal(false);
    setNewName('');
    setSelectedId(id);
    setDirty(false);
    toast.success('Screen added', `${name} is ready to edit. Press Save after changes.`);
  };

  const handleDeleteScreen = () => {
    if (!draft) return;
    if (screens.length <= 1) {
      toast.error('Cannot delete', 'Keep at least one cinema screen.');
      return;
    }
    if (!window.confirm(`Delete screen "${draft.name}"?`)) return;
    removeScreen(draft.id);
    toast.success('Screen deleted', draft.name);
  };

  const handleSeatClick = (seat: Seat) => {
    if (!draft) return;

    if (editMode === 'delete') {
      updateDraft((prev) => {
        const rows = prev.rows.map((row) => {
          if (row.label !== seat.row) return row;
          const total = row.left + row.right;
          if (total <= 1) return row;
          if (seat.number <= row.left) {
            return { ...row, left: Math.max(0, row.left - 1) };
          }
          return { ...row, right: Math.max(0, row.right - 1) };
        });
        return { ...prev, rows, seatMeta: pruneMeta({ ...prev, rows }) };
      });
      return;
    }

    updateDraft((prev) => {
      const current = prev.seatMeta[seat.id];
      const disabled = !(current?.disabled ?? seat.status === 'DISABLED');
      return {
        ...prev,
        seatMeta: {
          ...prev.seatMeta,
          [seat.id]: {
            category: 'STANDARD',
            disabled,
          },
        },
      };
    });
  };

  const setRowCount = (rowLabel: string, side: 'left' | 'right', delta: number) => {
    updateDraft((prev) => {
      const rows = prev.rows.map((row) => {
        if (row.label !== rowLabel) return row;
        const next = Math.max(0, row[side] + delta);
        return { ...row, [side]: next };
      });
      return { ...prev, rows, seatMeta: pruneMeta({ ...prev, rows }) };
    });
  };

  const renameRow = (oldLabel: string, newLabelRaw: string) => {
    const newLabel = newLabelRaw.trim().toUpperCase().slice(0, 4);
    if (!newLabel || newLabel === oldLabel) return;
    updateDraft((prev) => {
      if (prev.rows.some((r) => r.label === newLabel)) {
        toast.error('Label in use', `Row "${newLabel}" already exists.`);
        return prev;
      }
      return {
        ...prev,
        rows: prev.rows.map((r) => (r.label === oldLabel ? { ...r, label: newLabel } : r)),
        seatMeta: remappedMeta(prev.seatMeta, oldLabel, newLabel),
      };
    });
  };

  const addRow = () => {
    updateDraft((prev) => ({
      ...prev,
      rows: [...prev.rows, { label: nextRowLabel(prev.rows), left: 8, right: 8 }],
    }));
  };

  const removeRow = (label: string) => {
    updateDraft((prev) => {
      if (prev.rows.length <= 1) {
        toast.error('Cannot remove', 'Keep at least one row.');
        return prev;
      }
      const rows = prev.rows.filter((r) => r.label !== label);
      return { ...prev, rows, seatMeta: pruneMeta({ ...prev, rows }) };
    });
  };

  if (!draft) {
    return (
      <div className="space-y-4">
        <h1 className="text-2xl font-extrabold tracking-tight">Screens & Seats</h1>
        <p className="text-sm text-muted-foreground">No screens yet. Add one to begin.</p>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 bg-primary text-primary-foreground text-sm font-bold rounded-xl"
        >
          Add Screen
        </button>
      </div>
    );
  }

  const rows = draft.rows;

  return (
    <div className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight">Screens & Seats</h1>
          <p className="text-xs text-muted-foreground mt-1">
            Add cinema screens, edit seat counts and row labels, then Save to update the booking map
            immediately.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <select
            value={selectedId}
            onChange={(e) => handleSelectScreen(e.target.value)}
            className="py-2.5 px-4 bg-card text-foreground font-bold text-xs rounded-xl border border-border focus:outline-none"
          >
            {screens.map((h) => (
              <option key={h.id} value={h.id}>
                {h.name} ({h.screenType})
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-secondary text-foreground text-xs font-bold rounded-xl border border-border"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Screen
          </button>

          <button
            type="button"
            onClick={handleSave}
            disabled={!dirty}
            className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-primary text-primary-foreground text-xs font-bold rounded-xl shadow-sm disabled:opacity-40"
          >
            <Save className="w-3.5 h-3.5" />
            Save
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-[280px_1fr] gap-6">
        <div className="p-5 bg-card border border-border rounded-3xl space-y-4 h-fit">
          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Screen name
            </label>
            <input
              value={draft.name}
              onChange={(e) =>
                updateDraft((prev) => ({ ...prev, name: e.target.value }))
              }
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm font-semibold"
            />
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Screen type
            </label>
            <select
              value={draft.screenType}
              onChange={(e) =>
                updateDraft((prev) => ({
                  ...prev,
                  screenType: e.target.value as CinemaHall['screenType'],
                }))
              }
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm font-semibold"
            >
              {SCREEN_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <p className="text-xs text-muted-foreground">
            Total seats: <strong className="text-foreground">{countSeatsInRows(draft.rows)}</strong>
            {dirty ? ' · unsaved' : ' · saved'}
          </p>

          <div className="flex flex-col gap-2 pt-2 border-t border-border">
            <button
              type="button"
              onClick={addRow}
              className="px-3 py-2 rounded-xl bg-secondary text-xs font-bold border border-border"
            >
              Add row
            </button>
            <button
              type="button"
              onClick={handleDeleteScreen}
              className="inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold text-red-500 border border-red-500/30"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Delete screen
            </button>
          </div>
        </div>

        <div className="p-6 sm:p-8 bg-card border border-border rounded-3xl space-y-6 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 bg-secondary/40 rounded-2xl border border-border text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-foreground">Seat Action:</span>
              <button
                type="button"
                onClick={() => setEditMode('toggle')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  editMode === 'toggle'
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground border border-border hover:text-foreground'
                }`}
              >
                Enable / Disable Seat
              </button>
              <button
                type="button"
                onClick={() => setEditMode('delete')}
                className={`px-3 py-1.5 rounded-lg font-bold transition-all ${
                  editMode === 'delete'
                    ? 'bg-red-500 text-white'
                    : 'text-muted-foreground border border-border hover:text-foreground'
                }`}
              >
                Delete Seat
              </button>
            </div>
            <span className="text-[11px] text-muted-foreground">
              All seats belong to standard uniform category.
            </span>
          </div>

          <div className="w-full max-w-xl mx-auto flex flex-col items-center space-y-2">
            <div className="w-full h-2.5 bg-gradient-to-r from-transparent via-primary to-transparent rounded-full shadow-[0_4px_15px_rgba(229,9,20,0.5)]" />
            <span className="text-[9px] font-bold tracking-[0.3em] text-muted-foreground">
              PROJECTION SCREEN
            </span>
          </div>

          <div className="space-y-2 flex flex-col items-center overflow-x-auto pb-2">
            {rows.map((row) => {
              const rowSeats = seats
                .filter((s) => s.row === row.label)
                .sort((a, b) => a.number - b.number);
              const aisleAfter = getAisleAfter(row.label, draft.rows);

              return (
                <div key={row.label} className="flex items-start gap-2 min-w-min">
                  <div className="flex flex-col items-center gap-1 shrink-0 w-[4.5rem]">
                    <input
                      defaultValue={row.label}
                      key={`label-${row.label}`}
                      onBlur={(e) => renameRow(row.label, e.target.value)}
                      title="Row / column label"
                      className="w-full py-1 px-1 text-center bg-secondary hover:bg-primary/10 rounded text-[10px] font-bold border border-border"
                    />
                    <button
                      type="button"
                      onClick={() => removeRow(row.label)}
                      className="text-[9px] font-bold text-red-500/80 hover:text-red-500 mt-1"
                    >
                      Remove row
                    </button>
                  </div>

                  <div className="flex flex-col gap-1">
                    <div className="flex items-center gap-1">
                      <div className="flex items-center gap-0.5 mr-1">
                        <button
                          type="button"
                          onClick={() => setRowCount(row.label, 'left', -1)}
                          className="w-5 h-5 rounded bg-secondary border border-border flex items-center justify-center"
                          title="Remove left seat"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setRowCount(row.label, 'left', 1)}
                          className="w-5 h-5 rounded bg-secondary border border-border flex items-center justify-center"
                          title="Add left seat"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      {rowSeats.map((seat) => (
                        <React.Fragment key={seat.id}>
                          <button
                            type="button"
                            onClick={() => handleSeatClick(seat)}
                            className={`w-6 h-6 sm:w-7 sm:h-7 rounded-md text-[9px] font-bold border transition-all ${
                              seat.status === 'DISABLED'
                                ? 'bg-zinc-900 text-zinc-600 border-zinc-800 line-through opacity-40'
                                : 'bg-secondary text-foreground border-border'
                            }`}
                          >
                            {seat.number}
                          </button>
                          {seat.number === aisleAfter && (
                            <div className="w-5 sm:w-7 flex items-center justify-center shrink-0">
                              <span className="text-[9px] font-extrabold text-muted-foreground/70">
                                {row.label}
                              </span>
                            </div>
                          )}
                        </React.Fragment>
                      ))}

                      <div className="flex items-center gap-0.5 ml-1">
                        <button
                          type="button"
                          onClick={() => setRowCount(row.label, 'right', -1)}
                          className="w-5 h-5 rounded bg-secondary border border-border flex items-center justify-center"
                          title="Remove right seat"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setRowCount(row.label, 'right', 1)}
                          className="w-5 h-5 rounded bg-secondary border border-border flex items-center justify-center"
                          title="Add right seat"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <form
            onSubmit={handleAddScreen}
            className="w-full max-w-md bg-card border border-border rounded-3xl p-6 space-y-4 shadow-xl"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-extrabold">Add cinema screen</h2>
              <button type="button" onClick={() => setShowAddModal(false)}>
                <X className="w-5 h-5 text-muted-foreground" />
              </button>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground">Name</label>
              <input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="e.g. Hall 2"
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
                autoFocus
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground">Type</label>
              <select
                value={newType}
                onChange={(e) => setNewType(e.target.value as CinemaHall['screenType'])}
                className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm"
              >
                {SCREEN_TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="w-full py-3 bg-primary text-primary-foreground font-bold text-sm rounded-xl"
            >
              Create screen
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
