import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import { 
  UserProfile, 
  Post, 
  Application, 
  Message, 
  NotificationItem, 
  ODSlip 
} from '../types';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('your-project-id')
  );
};

// Create the Supabase client instance (or null if not configured)
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  : null;

/**
 * Storage keys for local-first fallback when Supabase credentials
 * are not yet provided in the environment.
 */
const FALLBACK_KEYS = {
  CURRENT_USER: 'connect_current_user_v3',
  PROFILES: 'connect_profiles_v3',
  OPPORTUNITIES: 'connect_opportunities_v3',
  APPLICATIONS: 'connect_applications_v3',
  MESSAGES: 'connect_messages_v3',
  NOTIFICATIONS: 'connect_notifications_v3',
  OD_SLIPS: 'connect_od_slips_v3',
};

// ----------------------------------------------------------------------------
// AUTHENTICATION REPOSITORY
// ----------------------------------------------------------------------------

export async function signUpWithEmail(email: string, password: string): Promise<{ user: User | null; session: Session | null; error: Error | null }> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { user: data.user, session: data.session, error };
  }

  // Local fallback simulation (strictly college email validated)
  const localId = `usr-${Date.now()}`;
  const mockUser = {
    id: localId,
    email,
    created_at: new Date().toISOString(),
  } as unknown as User;

  return { user: mockUser, session: null, error: null };
}

export async function signInWithEmail(email: string, password: string): Promise<{ user: User | null; session: Session | null; error: Error | null }> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { user: data.user, session: data.session, error };
  }

  // Local fallback: retrieve registered profile matching this email
  const existingProfiles = getFallbackProfiles();
  const profile = existingProfiles.find(p => p.email.toLowerCase() === email.toLowerCase());
  if (!profile) {
    return { user: null, session: null, error: new Error('No user account found matching this college email. Please register first.') };
  }

  const mockUser = {
    id: profile.id,
    email: profile.email,
  } as unknown as User;

  return { user: mockUser, session: null, error: null };
}

export async function signOutAuth(): Promise<{ error: Error | null }> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase.auth.signOut();
    return { error };
  }
  localStorage.removeItem(FALLBACK_KEYS.CURRENT_USER);
  return { error: null };
}

// ----------------------------------------------------------------------------
// PROFILES REPOSITORY
// ----------------------------------------------------------------------------

export function getFallbackProfiles(): UserProfile[] {
  try {
    const data = localStorage.getItem(FALLBACK_KEYS.PROFILES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveFallbackProfiles(profiles: UserProfile[]) {
  localStorage.setItem(FALLBACK_KEYS.PROFILES, JSON.stringify(profiles));
}

export async function fetchProfileById(userId: string): Promise<UserProfile | null> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !data) return null;
    return data as UserProfile;
  }

  const profiles = getFallbackProfiles();
  return profiles.find(p => p.id === userId) || null;
}

export async function saveProfile(profile: UserProfile): Promise<{ success: boolean; error: Error | null }> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase
      .from('profiles')
      .upsert(profile, { onConflict: 'id' });
    return { success: !error, error };
  }

  // Fallback: save to localStorage
  const profiles = getFallbackProfiles();
  const existingIdx = profiles.findIndex(p => p.id === profile.id);
  if (existingIdx >= 0) {
    profiles[existingIdx] = profile;
  } else {
    profiles.unshift(profile);
  }
  saveFallbackProfiles(profiles);
  return { success: true, error: null };
}

// ----------------------------------------------------------------------------
// OPPORTUNITIES REPOSITORY
// ----------------------------------------------------------------------------

export function getFallbackOpportunities(): Post[] {
  try {
    const data = localStorage.getItem(FALLBACK_KEYS.OPPORTUNITIES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveFallbackOpportunities(posts: Post[]) {
  localStorage.setItem(FALLBACK_KEYS.OPPORTUNITIES, JSON.stringify(posts));
}

export async function fetchOpportunities(): Promise<Post[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      return data as Post[];
    }
  }

  return getFallbackOpportunities();
}

// ----------------------------------------------------------------------------
// APPLICATIONS REPOSITORY
// ----------------------------------------------------------------------------

export function getFallbackApplications(): Application[] {
  try {
    const data = localStorage.getItem(FALLBACK_KEYS.APPLICATIONS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveFallbackApplications(apps: Application[]) {
  localStorage.setItem(FALLBACK_KEYS.APPLICATIONS, JSON.stringify(apps));
}

// ----------------------------------------------------------------------------
// MESSAGES REPOSITORY
// ----------------------------------------------------------------------------

export function getFallbackMessages(): Message[] {
  try {
    const data = localStorage.getItem(FALLBACK_KEYS.MESSAGES);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveFallbackMessages(msgs: Message[]) {
  localStorage.setItem(FALLBACK_KEYS.MESSAGES, JSON.stringify(msgs));
}

// ----------------------------------------------------------------------------
// NOTIFICATIONS REPOSITORY
// ----------------------------------------------------------------------------

export function getFallbackNotifications(): NotificationItem[] {
  try {
    const data = localStorage.getItem(FALLBACK_KEYS.NOTIFICATIONS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveFallbackNotifications(notifs: NotificationItem[]) {
  localStorage.setItem(FALLBACK_KEYS.NOTIFICATIONS, JSON.stringify(notifs));
}

// ----------------------------------------------------------------------------
// OD SLIPS REPOSITORY
// ----------------------------------------------------------------------------

export function getFallbackODSlips(): ODSlip[] {
  try {
    const data = localStorage.getItem(FALLBACK_KEYS.OD_SLIPS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveFallbackODSlips(slips: ODSlip[]) {
  localStorage.setItem(FALLBACK_KEYS.OD_SLIPS, JSON.stringify(slips));
}
