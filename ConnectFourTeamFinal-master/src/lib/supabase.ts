import { createClient, SupabaseClient, User, Session } from '@supabase/supabase-js';
import {
  UserProfile,
  Post,
  Application,
  ApplicationStatus,
  Message,
  NotificationItem,
  ODSlip,
  PostCategory,
  UserRole
} from '../types';

// Environment variables: support both standard and publishable key naming
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  '';

export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl &&
    supabaseAnonKey &&
    supabaseUrl.startsWith('http') &&
    !supabaseUrl.includes('your-project-id')
  );
};

// Create the singleton Supabase client instance
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
 * Storage keys for local-first fallback when offline or Supabase
 * is not yet configured in the environment.
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
// DATA SCHEMA RECONCILIATION MAPPERS (events <-> opportunities <-> Post)
// ----------------------------------------------------------------------------

export function mapDbRecordToPost(raw: any): Post {
  const category: PostCategory = [
    'STUDENT_CASUAL',
    'STUDENT_CREATIVE',
    'CARPOOL',
    'FACULTY_WORKSHOP',
    'FACULTY_RESEARCH',
    'FACULTY_VOLUNTEER'
  ].includes(raw.category) ? raw.category : 'STUDENT_CASUAL';

  const hostRole: UserRole = ['FACULTY', 'ADMIN'].includes(raw.host_role) ? raw.host_role : 'STUDENT';

  const startTime = raw.start_time || raw.event_date || raw.created_at || new Date().toISOString();
  const endTime = raw.end_time || raw.event_date || startTime;

  return {
    id: String(raw.id),
    host_id: raw.host_id || raw.user_id || 'campus-host',
    host_name: raw.host_name || 'Campus Organizer',
    host_role: hostRole,
    host_designation: raw.host_designation,
    title: raw.title || 'Untitled Opportunity',
    description: raw.description || '',
    instructions: raw.instructions || '',
    category,
    join_mode: raw.join_mode === 'LOCKED' ? 'LOCKED' : 'UNLOCKED',
    status: raw.status || 'OPEN',
    total_slots: Number(raw.total_slots || raw.capacity || 5),
    filled_slots: Number(raw.filled_slots || 0),
    required_skills: Array.isArray(raw.required_skills) ? raw.required_skills : (raw.skills || []),
    eligible_departments: Array.isArray(raw.eligible_departments) ? raw.eligible_departments : ['ANY'],
    eligible_years: Array.isArray(raw.eligible_years) ? raw.eligible_years : [2022, 2023, 2024, 2025],
    venue_name: raw.venue_name || raw.location || 'Academic Block 1 (AB1)',
    map_lat: raw.map_lat ? Number(raw.map_lat) : 10.9015,
    map_lng: raw.map_lng ? Number(raw.map_lng) : 76.9012,
    start_time: startTime,
    end_time: endTime,
    od_available: Boolean(raw.od_available),
    od_details: raw.od_details || '',
    od_hours: Number(raw.od_hours || (raw.od_available ? 8 : 0)),
    research_perks: raw.research_perks || '',
    weekly_commitment_hours: raw.weekly_commitment_hours ? Number(raw.weekly_commitment_hours) : undefined,
    carpool_origin: raw.carpool_origin,
    carpool_destination: raw.carpool_destination,
    carpool_cost_split: raw.carpool_cost_split,
    carpool_gender_pref: raw.carpool_gender_pref || 'ANY',
    carpool_seats_available: raw.carpool_seats_available ? Number(raw.carpool_seats_available) : undefined,
    carpool_notes: raw.carpool_notes,
    target_roles: raw.target_roles || [],
    created_at: raw.created_at || new Date().toISOString(),
  };
}

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

export async function getCurrentAuthUser(): Promise<User | null> {
  if (isSupabaseConfigured() && supabase) {
    const { data } = await supabase.auth.getUser();
    return data.user;
  }
  return null;
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

    if (!error && data) {
      return data as UserProfile;
    }
  }

  const profiles = getFallbackProfiles();
  return profiles.find(p => p.id === userId) || null;
}

export async function fetchAllProfiles(): Promise<UserProfile[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data && data.length > 0) {
      return data as UserProfile[];
    }
  }
  return getFallbackProfiles();
}

export async function saveProfile(profile: UserProfile): Promise<{ success: boolean; error: Error | null }> {
  if (isSupabaseConfigured() && supabase) {
    const { error } = await supabase
      .from('profiles')
      .upsert(profile, { onConflict: 'id' });
    if (!error) return { success: true, error: null };
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
// OPPORTUNITIES / EVENTS REPOSITORY (RECONCILED FOR CLOUD PERSISTENCE)
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

/**
 * Fetches shared records from Supabase.
 * Checks 'opportunities' first; if not found, falls back to 'events'.
 */
export async function fetchOpportunities(): Promise<Post[]> {
  if (isSupabaseConfigured() && supabase) {
    // 1. Attempt reading from 'opportunities' table
    const oppRes = await supabase
      .from('opportunities')
      .select('*')
      .order('created_at', { ascending: false });

    if (!oppRes.error && oppRes.data) {
      return oppRes.data.map(mapDbRecordToPost);
    }

    // 2. If 'opportunities' does not exist in schema cache, try 'events' table
    if (oppRes.error?.code === 'PGRST205' || oppRes.error?.message?.includes('opportunities')) {
      const eventRes = await supabase
        .from('events')
        .select('*')
        .order('created_at', { ascending: false });

      if (!eventRes.error && eventRes.data) {
        return eventRes.data.map(mapDbRecordToPost);
      }
    }
  }

  return getFallbackOpportunities();
}

/**
 * Creates and persists a new opportunity / event record in Supabase.
 * Adapts to either 'opportunities' or 'events' depending on database schema.
 */
export async function createCloudOpportunity(
  post: Partial<Post>
): Promise<{ success: boolean; post?: Post; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, error: 'Supabase client is not configured.' };
  }

  // 1. Try inserting into 'opportunities' table
  const oppPayload = {
    title: post.title,
    description: post.description,
    instructions: post.instructions || null,
    category: post.category || 'STUDENT_CASUAL',
    join_mode: post.join_mode || 'UNLOCKED',
    status: post.status || 'OPEN',
    total_slots: post.total_slots || 5,
    filled_slots: post.filled_slots || 0,
    required_skills: post.required_skills || [],
    eligible_departments: post.eligible_departments || ['ANY'],
    eligible_years: post.eligible_years || [2022, 2023, 2024, 2025],
    venue_name: post.venue_name || 'Academic Block 1 (AB1)',
    start_time: post.start_time,
    end_time: post.end_time,
    od_available: Boolean(post.od_available),
    od_details: post.od_details || null,
    od_hours: post.od_hours || 0,
    carpool_origin: post.carpool_origin || null,
    carpool_destination: post.carpool_destination || null,
    carpool_cost_split: post.carpool_cost_split || null,
    carpool_gender_pref: post.carpool_gender_pref || 'ANY',
    host_id: post.host_id,
    host_name: post.host_name,
    host_role: post.host_role || 'STUDENT',
  };

  const oppInsert = await supabase
    .from('opportunities')
    .insert(oppPayload)
    .select()
    .single();

  if (!oppInsert.error && oppInsert.data) {
    return { success: true, post: mapDbRecordToPost(oppInsert.data) };
  }

  // 2. If 'opportunities' does not exist in schema cache, insert into 'events' table
  if (oppInsert.error?.code === 'PGRST205' || oppInsert.error?.message?.includes('opportunities')) {
    const eventPayload: Record<string, any> = {
      title: post.title,
      description: post.description,
      category: post.category || 'STUDENT_CASUAL',
      location: post.venue_name || 'Academic Block 1 (AB1)',
      event_date: post.start_time || new Date().toISOString(),
    };

    // If host details can be passed, include them
    if (post.host_name) eventPayload.host_name = post.host_name;
    if (post.host_role) eventPayload.host_role = post.host_role;

    const eventInsert = await supabase
      .from('events')
      .insert(eventPayload)
      .select()
      .single();

    if (!eventInsert.error && eventInsert.data) {
      return { success: true, post: mapDbRecordToPost(eventInsert.data) };
    }

    return {
      success: false,
      error: eventInsert.error?.message || 'Database insert failed on events table.'
    };
  }

  return {
    success: false,
    error: oppInsert.error?.message || 'Database insert failed on opportunities table.'
  };
}

/**
 * Updates an existing opportunity / event in Supabase.
 */
export async function updateCloudOpportunity(
  id: string,
  updates: Partial<Post>
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, error: 'Supabase client is not configured.' };
  }

  // Try opportunities table first
  const oppRes = await supabase
    .from('opportunities')
    .update(updates)
    .eq('id', id);

  if (!oppRes.error) return { success: true };

  // Fallback to events table
  const eventRes = await supabase
    .from('events')
    .update({
      title: updates.title,
      description: updates.description,
      location: updates.venue_name,
      category: updates.category,
      event_date: updates.start_time,
    })
    .eq('id', id);

  if (!eventRes.error) return { success: true };

  return { success: false, error: oppRes.error?.message || eventRes.error?.message };
}

/**
 * Deletes an opportunity / event in Supabase.
 */
export async function deleteCloudOpportunity(
  id: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    return { success: false, error: 'Supabase client is not configured.' };
  }

  const oppRes = await supabase
    .from('opportunities')
    .delete()
    .eq('id', id);

  if (!oppRes.error) return { success: true };

  const eventRes = await supabase
    .from('events')
    .delete()
    .eq('id', id);

  if (!eventRes.error) return { success: true };

  return { success: false, error: oppRes.error?.message || eventRes.error?.message };
}

// ----------------------------------------------------------------------------
// APPLICATIONS REPOSITORY (CLOUD SYNCHRONIZED)
// ----------------------------------------------------------------------------

export function mapDbRecordToApplication(raw: any): Application {
  let status: ApplicationStatus = 'PENDING';
  const rawStatus = String(raw.status || '').toUpperCase();
  if (rawStatus === 'ACCEPTED' || rawStatus === 'APPROVED') {
    status = 'ACCEPTED';
  } else if (rawStatus === 'REJECTED') {
    status = 'REJECTED';
  } else if (rawStatus === 'INVITED') {
    status = 'INVITED';
  }

  return {
    id: String(raw.id),
    post_id: String(raw.post_id),
    applicant_id: String(raw.applicant_id),
    applicant_name: raw.applicant_name || 'Student Applicant',
    applicant_roll: raw.applicant_roll || '',
    applicant_dept: raw.applicant_dept || 'Engineering',
    applicant_year: raw.applicant_year ? Number(raw.applicant_year) : undefined,
    applicant_skills: Array.isArray(raw.applicant_skills) ? raw.applicant_skills : [],
    assigned_role: raw.assigned_role || 'Participant',
    status,
    attended: Boolean(raw.attended),
    message: raw.message || '',
    created_at: raw.created_at || new Date().toISOString(),
  };
}

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

/**
 * Fetches all applications from Supabase cloud database.
 */
export async function fetchCloudApplications(): Promise<Application[]> {
  if (isSupabaseConfigured() && supabase) {
    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      const apps = data.map(mapDbRecordToApplication);
      saveFallbackApplications(apps);
      return apps;
    }
    if (error) {
      console.warn('fetchCloudApplications error:', error.message);
    }
  }
  return getFallbackApplications();
}

/**
 * Creates and persists a new application / join request in Supabase.
 */
export async function createCloudApplication(
  app: Partial<Application>
): Promise<{ success: boolean; application?: Application; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    // Local fallback
    const localApp: Application = {
      id: app.id || `app-${Date.now()}`,
      post_id: app.post_id!,
      applicant_id: app.applicant_id!,
      applicant_name: app.applicant_name || 'Student',
      applicant_roll: app.applicant_roll,
      applicant_dept: app.applicant_dept,
      applicant_year: app.applicant_year,
      applicant_skills: app.applicant_skills || [],
      assigned_role: app.assigned_role || 'Participant',
      status: (app.status as ApplicationStatus) || 'PENDING',
      attended: Boolean(app.attended),
      message: app.message || '',
      created_at: app.created_at || new Date().toISOString(),
    };
    const list = getFallbackApplications();
    list.unshift(localApp);
    saveFallbackApplications(list);
    return { success: true, application: localApp };
  }

  // 1. Prevent duplicate submission in Supabase
  const existing = await supabase
    .from('applications')
    .select('id, status')
    .eq('post_id', app.post_id)
    .eq('applicant_id', app.applicant_id)
    .maybeSingle();

  if (existing.data) {
    const currentStatus = String(existing.data.status).toUpperCase();
    if (currentStatus === 'ACCEPTED' || currentStatus === 'APPROVED') {
      return { success: false, error: 'You are already an approved participant for this event.' };
    }
    if (currentStatus === 'PENDING') {
      return { success: false, error: 'You already have a pending request for this event.' };
    }
    if (currentStatus === 'REJECTED') {
      return { success: false, error: 'Your previous request for this event was declined.' };
    }
  }

  // 2. Insert into Supabase
  const payload = {
    post_id: app.post_id,
    applicant_id: app.applicant_id,
    applicant_name: app.applicant_name,
    applicant_roll: app.applicant_roll || null,
    applicant_dept: app.applicant_dept || null,
    applicant_year: app.applicant_year || null,
    applicant_skills: app.applicant_skills || [],
    assigned_role: app.assigned_role || 'Participant',
    status: (app.status || 'PENDING').toUpperCase(),
    attended: false,
    message: app.message || null,
  };

  const { data, error } = await supabase
    .from('applications')
    .insert(payload)
    .select()
    .single();

  if (error) {
    if (error.code === '23505') {
      return { success: false, error: 'You have already submitted a request for this event.' };
    }
    return { success: false, error: error.message };
  }

  const newApp = mapDbRecordToApplication(data);
  return { success: true, application: newApp };
}

/**
 * Updates application status in Supabase (Host Approve / Reject).
 */
export async function updateCloudApplicationStatus(
  appId: string,
  status: ApplicationStatus
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    // Local fallback
    const list = getFallbackApplications();
    const idx = list.findIndex(a => a.id === appId);
    if (idx >= 0) {
      list[idx].status = status;
      saveFallbackApplications(list);
    }
    return { success: true };
  }

  const { error } = await supabase
    .from('applications')
    .update({
      status: status.toUpperCase(),
      updated_at: new Date().toISOString(),
    })
    .eq('id', appId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

/**
 * Deletes an application from Supabase (Withdraw request).
 */
export async function deleteCloudApplication(
  appId: string
): Promise<{ success: boolean; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    const list = getFallbackApplications();
    saveFallbackApplications(list.filter(a => a.id !== appId));
    return { success: true };
  }

  const { error } = await supabase
    .from('applications')
    .delete()
    .eq('id', appId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

// ----------------------------------------------------------------------------
// MESSAGES REPOSITORY (SCOPED REALTIME GROUP CHAT)
// ----------------------------------------------------------------------------

export function mapDbRecordToMessage(raw: any): Message {
  return {
    id: String(raw.id),
    post_id: String(raw.post_id),
    sender_id: String(raw.sender_id),
    sender_name: raw.sender_name || 'Anonymous User',
    sender_role: (raw.sender_role as UserRole) || 'STUDENT',
    sender_roll: raw.sender_roll || undefined,
    content: raw.content || '',
    created_at: raw.created_at || new Date().toISOString(),
  };
}

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

/**
 * Fetches group chat messages from Supabase cloud database.
 */
export async function fetchCloudMessages(postId?: string): Promise<Message[]> {
  if (isSupabaseConfigured() && supabase) {
    let query = supabase
      .from('messages')
      .select('*')
      .order('created_at', { ascending: true });

    if (postId) {
      query = query.eq('post_id', postId);
    }

    const { data, error } = await query;
    if (!error && data) {
      const msgs = data.map(mapDbRecordToMessage);
      if (!postId) {
        saveFallbackMessages(msgs);
      }
      return msgs;
    }
    if (error) {
      console.warn('fetchCloudMessages error:', error.message);
    }
  }

  const fallback = getFallbackMessages();
  return postId ? fallback.filter(m => m.post_id === postId) : fallback;
}

/**
 * Inserts and persists a new group chat message in Supabase.
 */
export async function sendCloudMessage(
  msg: Partial<Message>
): Promise<{ success: boolean; message?: Message; error?: string }> {
  if (!isSupabaseConfigured() || !supabase) {
    const localMsg: Message = {
      id: msg.id || `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      post_id: msg.post_id!,
      sender_id: msg.sender_id!,
      sender_name: msg.sender_name || 'User',
      sender_role: msg.sender_role || 'STUDENT',
      sender_roll: msg.sender_roll,
      content: msg.content || '',
      created_at: msg.created_at || new Date().toISOString(),
    };
    const list = getFallbackMessages();
    list.push(localMsg);
    saveFallbackMessages(list);
    return { success: true, message: localMsg };
  }

  const payload = {
    post_id: msg.post_id,
    sender_id: msg.sender_id,
    sender_name: msg.sender_name,
    sender_role: msg.sender_role || 'STUDENT',
    sender_roll: msg.sender_roll || null,
    content: msg.content?.trim(),
  };

  const { data, error } = await supabase
    .from('messages')
    .insert(payload)
    .select()
    .single();

  if (error) {
    console.error('sendCloudMessage error:', error.message);
    return { success: false, error: error.message };
  }

  const savedMsg = mapDbRecordToMessage(data);
  return { success: true, message: savedMsg };
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
