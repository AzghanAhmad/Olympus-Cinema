import { apiFetch, ApiSuccess } from '@/lib/api';
import { useSiteSettingsStore } from '@/store/useSiteSettingsStore';

export async function hydrateSiteSettings(): Promise<void> {
  try {
    const res = await apiFetch<ApiSuccess<Record<string, unknown>>>('/settings');
    const s = res.data ?? {};
    const store = useSiteSettingsStore.getState();

    const cinemaName = String(s.cinemaName ?? s.siteName ?? store.cinemaName);
    store.setCinemaName(cinemaName);

    if (s.maxTicketsPerPerson != null) {
      store.setMaxTicketsPerPerson(Number(s.maxTicketsPerPerson));
    }
    if (s.seatHoldDuration != null) {
      store.setSeatHoldMinutes(Number(s.seatHoldDuration));
    }
    if (s.ticketPrice != null) {
      store.setTicketPrice(Number(s.ticketPrice));
    }
  } catch {
    /* keep persisted defaults when API is unavailable */
  }
}

export type PublicSiteSettings = {
  cinemaName: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
};

export async function getPublicSiteSettings(): Promise<PublicSiteSettings> {
  const store = useSiteSettingsStore.getState();
  try {
    const res = await apiFetch<ApiSuccess<Record<string, unknown>>>('/settings');
    const s = res.data ?? {};
    return {
      cinemaName: String(s.cinemaName ?? s.siteName ?? store.cinemaName),
      contactEmail: String(s.contactEmail ?? ''),
      contactPhone: String(s.contactPhone ?? ''),
      address: String(s.address ?? ''),
    };
  } catch {
    return {
      cinemaName: store.cinemaName,
      contactEmail: '',
      contactPhone: '',
      address: '',
    };
  }
}
