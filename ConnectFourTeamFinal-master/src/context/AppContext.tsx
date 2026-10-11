import React, { createContext, useContext, useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import { 
  UserProfile, 
  Post, 
  Application, 
  Message, 
  NotificationItem, 
  ODSlip, 
  CampusLandmark, 
  AcademicCalendarItem 
} from '../types';
import { 
  CAMPUS_LANDMARKS, 
  ACADEMIC_CALENDAR_ITEMS 
} from '../data/seedData';
import { detectScheduleClash, ClashDetail } from '../utils/clashDetector';
import { 
  canAccessScopedChat, 
  canReviewApplication, 
  canIssueODSlip,
  canAccessFacultyPortal
} from '../utils/security';
import {
  signUpWithEmail,
  signInWithEmail,
  signOutAuth,
  getFallbackProfiles,
  saveFallbackProfiles,
  getFallbackOpportunities,
  saveFallbackOpportunities,
  getFallbackApplications,
  saveFallbackApplications,
  getFallbackMessages,
  saveFallbackMessages,
  getFallbackNotifications,
  saveFallbackNotifications,
  getFallbackODSlips,
  saveFallbackODSlips,
  isSupabaseConfigured,
  createCloudOpportunity,
  updateCloudOpportunity,
  deleteCloudOpportunity,
  fetchOpportunities,
  fetchCloudApplications,
  createCloudApplication,
  updateCloudApplicationStatus,
  deleteCloudApplication,
  cancelCloudParticipation,
  fetchCloudMessages,
  sendCloudMessage,
  mapDbRecordToMessage,
  mapDbRecordToApplication,
  mapDbRecordToPost,
  fetchAllProfiles,
  saveProfile,
  supabase
} from '../lib/supabase';

export type NavigationTab = 
  | 'events'
  | 'calendar'
  | 'my-activities'
  | 'find-people'
  | 'faculty-portal'
  // Backward compatibility aliases
  | 'opportunities'
  | 'feed'
  | 'carpool';

interface AppContextType {
  currentUser: UserProfile | null;
  setCurrentUser: (user: UserProfile | null) => void;
  isAuthenticated: boolean;
  allUsers: UserProfile[];
  posts: Post[];
  applications: Application[];
  messages: Message[];
  notifications: NotificationItem[];
  odSlips: ODSlip[];
  landmarks: CampusLandmark[];
  calendarItems: AcademicCalendarItem[];
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;
  
  // Theme Management (Dark / Light mode)
  theme: 'dark' | 'light';
  setTheme: (theme: 'dark' | 'light') => void;
  toggleTheme: () => void;
  
  // Modals & Active View States
  selectedPostForDetail: Post | null;
  setSelectedPostForDetail: (post: Post | null) => void;
  selectedPostForChat: Post | null;
  setSelectedPostForChat: (post: Post | null) => void;
  selectedODSlipForView: ODSlip | null;
  setSelectedODSlipForView: (slip: ODSlip | null) => void;
  isCreatePostModalOpen: boolean;
  setIsCreatePostModalOpen: (open: boolean) => void;
  isAuthModalOpen: boolean;
  setIsAuthModalOpen: (open: boolean) => void;
  authModalMode: 'LOGIN' | 'REGISTER';
  setAuthModalMode: (mode: 'LOGIN' | 'REGISTER') => void;
  isProfileModalOpen: boolean;
  setIsProfileModalOpen: (open: boolean) => void;
  isMapModalOpen: boolean;
  setIsMapModalOpen: (open: boolean) => void;
  
  // Backend configuration status
  isSupabaseActive: boolean;

  // Category pre-selection (e.g. when filtering carpool)
  selectedCategoryFilter: string;
  setSelectedCategoryFilter: (cat: string) => void;

  // Real Authentication actions
  registerNewAccount: (email: string, password: string, initialProfile?: Partial<UserProfile>) => Promise<{ success: boolean; userId?: string; message?: string }>;
  loginExistingAccount: (email: string, password: string) => Promise<{ success: boolean; message?: string }>;
  signOutUser: () => Promise<void>;
  updateCurrentUserProfile: (updates: Partial<UserProfile>) => void;
  
  // Real Opportunity actions
  createPost: (postData: Partial<Post>) => Promise<{ success: boolean; post?: Post; error?: string }>;
  deletePost: (postId: string) => Promise<{ success: boolean; message: string }>;
  cancelEventParticipation: (postId: string) => Promise<{ success: boolean; message: string }>;
  refreshEvents: () => Promise<void>;
  refreshApplications: () => Promise<void>;
  isCloudConnected: boolean;
  joinPost: (postId: string, role?: string, message?: string) => Promise<{ success: boolean; message: string }>;
  withdrawApplication: (appId: string) => Promise<boolean> | boolean;
  reviewApplication: (appId: string, status: 'ACCEPTED' | 'REJECTED', feedback?: string) => Promise<{ success: boolean; message: string }>;
  markAttendance: (appId: string, attended: boolean) => void;
  generateODSlip: (appId: string) => ODSlip | null;
  sendMessage: (postId: string, content: string) => Promise<boolean> | boolean;
  refreshMessages: (postId?: string) => Promise<void>;
  inviteUserToPost: (targetUserId: string, postId: string, note?: string) => boolean;
  acceptInvite: (notificationId: string, postId: string) => void;
  declineInvite: (notificationId: string) => void;
  markNotificationRead: (notifId: string) => void;
  markAllNotificationsRead: () => void;
  checkScheduleClash: (startTime: string, endTime: string, currentPostId?: string) => ClashDetail;
  canAccessChat: (post: Post | null, userId?: string) => boolean;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const CURRENT_USER_STORAGE_KEY = 'connect_current_user_v3';

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Profiles
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => getFallbackProfiles());

  // Current logged in user (starts from persistent session or null)
  const [currentUser, setCurrentUserState] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem(CURRENT_USER_STORAGE_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  // Posts / Opportunities
  const [posts, setPosts] = useState<Post[]>(() => getFallbackOpportunities());

  // Applications
  const [applications, setApplications] = useState<Application[]>(() => getFallbackApplications());

  // Messages
  const [messages, setMessages] = useState<Message[]>(() => getFallbackMessages());

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => getFallbackNotifications());

  // OD Slips
  const [odSlips, setOdSlips] = useState<ODSlip[]>(() => getFallbackODSlips());

  // Landmarks & Calendar items (static campus data)
  const [landmarks] = useState<CampusLandmark[]>(CAMPUS_LANDMARKS);
  const [calendarItems] = useState<AcademicCalendarItem[]>(ACADEMIC_CALENDAR_ITEMS);

  // Active navigation tab (Default to 'events')
  const [activeTab, setActiveTabRaw] = useState<NavigationTab>('events');

  // Theme state (Dark default with persistent Light mode toggle)
  const [theme, setThemeState] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('connect_theme');
      if (saved === 'light' || saved === 'dark') return saved;
    } catch {}
    return 'dark';
  });

  const setTheme = (newTheme: 'dark' | 'light') => {
    setThemeState(newTheme);
    try {
      localStorage.setItem('connect_theme', newTheme);
    } catch {}
    if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
      document.documentElement.setAttribute('data-theme', 'light');
    }
  }, [theme]);

  // Category filter state (used to filter e.g. Carpool inside Events)
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('ALL');

  // Modals
  const [selectedPostForDetail, setSelectedPostForDetail] = useState<Post | null>(null);
  const [selectedPostForChat, setSelectedPostForChat] = useState<Post | null>(null);
  const [selectedODSlipForView, setSelectedODSlipForView] = useState<ODSlip | null>(null);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'LOGIN' | 'REGISTER'>('LOGIN');
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);
  const [isCloudConnected, setIsCloudConnected] = useState<boolean>(isSupabaseConfigured());

  // Load shared cloud opportunities and applications on mount
  useEffect(() => {
    let isMounted = true;
    const loadSharedData = async () => {
      if (isSupabaseConfigured()) {
        try {
          const [cloudPosts, cloudApps, cloudMsgs, cloudProfiles] = await Promise.all([
            fetchOpportunities(),
            fetchCloudApplications(),
            fetchCloudMessages(),
            fetchAllProfiles()
          ]);
          if (isMounted) {
            if (cloudPosts && cloudPosts.length > 0) {
              setPosts(cloudPosts);
            }
            if (cloudApps) {
              setApplications(cloudApps);
            }
            if (cloudMsgs && cloudMsgs.length > 0) {
              setMessages(cloudMsgs);
            }
            if (cloudProfiles && cloudProfiles.length > 0) {
              setAllUsers(cloudProfiles);
            }
            setIsCloudConnected(true);
          }
        } catch (err) {
          console.error('Error loading cloud data on mount:', err);
          if (isMounted) setIsCloudConnected(false);
        }
      }
    };
    loadSharedData();
    return () => { isMounted = false; };
  }, []);

  // Comprehensive Realtime subscription for applications, opportunities, and group chat messages
  useEffect(() => {
    if (isSupabaseConfigured() && supabase) {
      const channel = supabase
        .channel('connect-live-sync')
        // 1. Applications changes (join requests, approvals, rejections)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'applications' },
          async (payload) => {
            try {
              if (payload.eventType === 'INSERT' && payload.new) {
                const newApp = mapDbRecordToApplication(payload.new);
                setApplications(prev => [newApp, ...prev.filter(a => a.id !== newApp.id)]);
              } else if (payload.eventType === 'UPDATE' && payload.new) {
                const updatedApp = mapDbRecordToApplication(payload.new);
                setApplications(prev => prev.map(a => a.id === updatedApp.id ? updatedApp : a));
                // Automatically reflect participant counts without page reload
                if (updatedApp.status === 'ACCEPTED') {
                  setPosts(prev => prev.map(p => {
                    if (p.id === updatedApp.post_id) {
                      const newFilled = Math.min(p.total_slots, p.filled_slots + 1);
                      return { ...p, filled_slots: newFilled, status: newFilled >= p.total_slots ? 'FULL' : p.status };
                    }
                    return p;
                  }));
                }
              } else if (payload.eventType === 'DELETE' && payload.old) {
                setApplications(prev => prev.filter(a => a.id !== String(payload.old.id)));
              }

              // Background reconciliation
              const freshApps = await fetchCloudApplications();
              if (freshApps) {
                setApplications(freshApps);
              }
            } catch (err) {
              console.warn('Realtime application sync failed:', err);
            }
          }
        )
        // 2. Opportunities changes (participant slot count updates, status changes)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'opportunities' },
          (payload) => {
            try {
              if (payload.eventType === 'UPDATE' && payload.new) {
                const updatedPost = mapDbRecordToPost(payload.new);
                setPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
              } else if (payload.eventType === 'INSERT' && payload.new) {
                const newPost = mapDbRecordToPost(payload.new);
                setPosts(prev => [newPost, ...prev.filter(p => p.id !== newPost.id)]);
              } else if (payload.eventType === 'DELETE' && payload.old) {
                setPosts(prev => prev.filter(p => p.id !== String(payload.old.id)));
              }
            } catch (err) {
              console.warn('Realtime opportunity sync failed:', err);
            }
          }
        )
        // 3. Messages changes (group chat messages in real time)
        .on(
          'postgres_changes',
          { event: 'INSERT', schema: 'public', table: 'messages' },
          (payload) => {
            try {
              if (payload.new) {
                const newMsg = mapDbRecordToMessage(payload.new);
                setMessages(prev => {
                  if (prev.some(m => m.id === newMsg.id)) return prev;
                  return [...prev, newMsg];
                });
              }
            } catch (err) {
              console.warn('Realtime message sync failed:', err);
            }
          }
        )
        // 4. Realtime Broadcast for instant zero-latency peer messaging
        .on(
          'broadcast',
          { event: 'new-chat-message' },
          (payload) => {
            try {
              if (payload.payload) {
                const broadcastMsg = payload.payload as Message;
                setMessages(prev => {
                  if (prev.some(m => m.id === broadcastMsg.id)) return prev;
                  return [...prev, broadcastMsg];
                });
              }
            } catch (err) {
              console.warn('Broadcast chat sync failed:', err);
            }
          }
        )
        .subscribe();

      return () => {
        if (supabase) {
          supabase.removeChannel(channel);
        }
      };
    }
  }, []);

  // Listen to Supabase Auth state changes
  useEffect(() => {
    if (isSupabaseConfigured() && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
        if (!session?.user && currentUser && currentUser.id.startsWith('usr-')) {
          // Keep local profile if in offline mode
        }
      });
      return () => subscription.unsubscribe();
    }
  }, [currentUser]);

  const refreshApplications = async () => {
    if (isSupabaseConfigured()) {
      try {
        const cloudApps = await fetchCloudApplications();
        if (cloudApps) {
          setApplications(cloudApps);
        }
      } catch (err) {
        console.error('Error refreshing cloud applications:', err);
      }
    }
  };

  const refreshEvents = async () => {
    if (isSupabaseConfigured()) {
      try {
        const [cloudPosts, cloudApps] = await Promise.all([
          fetchOpportunities(),
          fetchCloudApplications()
        ]);
        if (cloudPosts) {
          setPosts(cloudPosts);
        }
        if (cloudApps) {
          setApplications(cloudApps);
        }
        setIsCloudConnected(true);
      } catch (err) {
        console.error('Error refreshing cloud events:', err);
        setIsCloudConnected(false);
      }
    }
  };

  // Set active tab with role-awareness and backward compatibility mapping
  const setActiveTab = (tab: NavigationTab) => {
    let normalizedTab = tab;
    // Map legacy 'opportunities' or 'feed' to 'events'
    if (tab === 'opportunities' || tab === 'feed') {
      normalizedTab = 'events';
    }
    // Map legacy 'carpool' to 'events' with CARPOOL category active
    if (tab === 'carpool') {
      normalizedTab = 'events';
      setSelectedCategoryFilter('CARPOOL');
    }

    // Role-based portal protection:
    // If student attempts to navigate to faculty-portal, block and redirect to events
    if (normalizedTab === 'faculty-portal' && (!currentUser || !canAccessFacultyPortal(currentUser))) {
      normalizedTab = 'events';
    }

    setActiveTabRaw(normalizedTab);
  };

  // Sync state changes to persistence
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem(CURRENT_USER_STORAGE_KEY, JSON.stringify(currentUser));
    } else {
      localStorage.removeItem(CURRENT_USER_STORAGE_KEY);
    }
  }, [currentUser]);

  useEffect(() => {
    saveFallbackProfiles(allUsers);
  }, [allUsers]);

  useEffect(() => {
    saveFallbackOpportunities(posts);
  }, [posts]);

  useEffect(() => {
    saveFallbackApplications(applications);
  }, [applications]);

  useEffect(() => {
    saveFallbackMessages(messages);
  }, [messages]);

  useEffect(() => {
    saveFallbackNotifications(notifications);
  }, [notifications]);

  useEffect(() => {
    saveFallbackODSlips(odSlips);
  }, [odSlips]);

  // Ensure role-based portal security on role changes
  useEffect(() => {
    if (activeTab === 'faculty-portal' && (!currentUser || !canAccessFacultyPortal(currentUser))) {
      setActiveTabRaw('events');
    }
  }, [currentUser, activeTab]);

  const setCurrentUser = (user: UserProfile | null) => {
    setCurrentUserState(user);
    if (user) {
      setAllUsers(prev => {
        const idx = prev.findIndex(u => u.id === user.id);
        if (idx >= 0) {
          const updated = [...prev];
          updated[idx] = user;
          return updated;
        }
        return [user, ...prev];
      });
    }
  };

  const updateCurrentUserProfile = (updates: Partial<UserProfile>) => {
    if (!currentUser) return;
    // Disallow self-modification of role or verified flag
    const { role: _r, is_verified: _v, ...permittedUpdates } = updates;
    const updated: UserProfile = { ...currentUser, ...permittedUpdates };
    setCurrentUserState(updated);
    saveProfile(updated);
    setAllUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
  };

  // Register real account (College Email + Password)
  const registerNewAccount = async (
    email: string, 
    password: string, 
    initialProfile?: Partial<UserProfile>
  ): Promise<{ success: boolean; userId?: string; message?: string }> => {
    const { user, error } = await signUpWithEmail(email, password);
    if (error) {
      return { success: false, message: error.message };
    }

    const userId = user?.id || `user-${Date.now()}`;
    const newProfile: UserProfile = {
      id: userId,
      full_name: initialProfile?.full_name || email.split('@')[0],
      email: email.trim().toLowerCase(),
      role: initialProfile?.role || 'STUDENT',
      roll_number: initialProfile?.roll_number,
      department: initialProfile?.department || 'Engineering',
      joining_year: initialProfile?.joining_year,
      designation: initialProfile?.designation,
      bio: initialProfile?.bio || '',
      skills: initialProfile?.skills || ['Collaboration'],
      interests: initialProfile?.interests || ['Campus Events'],
      github_url: initialProfile?.github_url,
      linkedin_url: initialProfile?.linkedin_url,
      is_verified: initialProfile?.role === 'STUDENT',
      created_at: new Date().toISOString(),
    };

    setCurrentUser(newProfile);
    saveProfile(newProfile);
    setAllUsers(prev => [newProfile, ...prev.filter(u => u.id !== newProfile.id)]);
    return { success: true, userId, message: 'Account registered successfully.' };
  };

  // Sign in existing account
  const loginExistingAccount = async (
    email: string, 
    password: string
  ): Promise<{ success: boolean; message?: string }> => {
    const { user, error } = await signInWithEmail(email, password);
    if (error) {
      return { success: false, message: error.message };
    }

    // Load profile
    const existing = allUsers.find(u => u.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      setCurrentUser(existing);
      return { success: true };
    } else if (user) {
      const fallbackProfile: UserProfile = {
        id: user.id,
        full_name: email.split('@')[0],
        email: email.toLowerCase(),
        role: 'STUDENT',
        department: 'General Engineering',
        skills: ['General Collaboration'],
        interests: ['Campus Activities'],
        created_at: new Date().toISOString(),
      };
      setCurrentUser(fallbackProfile);
      return { success: true };
    }

    return { success: false, message: 'Could not locate account profile.' };
  };

  // Sign out
  const signOutUser = async () => {
    await signOutAuth();
    setCurrentUserState(null);
  };

  // Clash detection using clashDetector utility
  const checkScheduleClash = (startTimeStr: string, endTimeStr: string, currentPostId?: string): ClashDetail => {
    return detectScheduleClash(
      startTimeStr,
      endTimeStr,
      calendarItems,
      posts,
      applications,
      currentUser?.id || 'guest',
      currentPostId
    );
  };

  // Permission check for scoped group chat: only host + accepted applicants
  const canAccessChat = (post: Post | null, userId?: string): boolean => {
    if (!post) return false;
    const user = (userId ? allUsers.find(u => u.id === userId) : null) || currentUser || null;
    return canAccessScopedChat(user, post, applications);
  };

  // Create real opportunity with Supabase cloud persistence
  const createPost = async (postData: Partial<Post>): Promise<{ success: boolean; post?: Post; error?: string }> => {
    const host = currentUser || {
      id: 'user-guest',
      full_name: 'Campus Organizer',
      role: 'STUDENT' as const,
      email: 'organizer@cb.students.amrita.edu',
      department: 'Engineering',
      skills: [],
      interests: [],
    };

    const newPostData: Partial<Post> = {
      ...postData,
      host_id: host.id,
      host_name: host.full_name,
      host_role: host.role,
      host_designation: host.designation,
      title: postData.title || 'Untitled Opportunity',
      description: postData.description || '',
      instructions: postData.instructions || '',
      category: postData.category || 'STUDENT_CASUAL',
      join_mode: postData.join_mode || 'UNLOCKED',
      status: 'OPEN',
      total_slots: postData.total_slots || 5,
      filled_slots: 0,
      required_skills: postData.required_skills || [],
      eligible_departments: postData.eligible_departments || ['ANY'],
      eligible_years: postData.eligible_years || [2022, 2023, 2024, 2025],
      venue_name: postData.venue_name || 'Academic Block 1 (AB1)',
      map_lat: postData.map_lat || 10.9015,
      map_lng: postData.map_lng || 76.9012,
      start_time: postData.start_time || new Date(Date.now() + 86400000 * 2).toISOString(),
      end_time: postData.end_time || new Date(Date.now() + 86400000 * 2 + 7200000).toISOString(),
      od_available: Boolean(postData.od_available),
      od_details: postData.od_details || '',
      od_hours: postData.od_hours || (postData.od_available ? 8 : 0),
      research_perks: postData.research_perks || '',
      weekly_commitment_hours: postData.weekly_commitment_hours,
      carpool_origin: postData.carpool_origin,
      carpool_destination: postData.carpool_destination,
      carpool_cost_split: postData.carpool_cost_split,
      carpool_gender_pref: postData.carpool_gender_pref || 'ANY',
      carpool_seats_available: postData.carpool_seats_available,
      carpool_notes: postData.carpool_notes,
      target_roles: postData.target_roles || [],
      created_at: new Date().toISOString(),
    };

    // Attempt cloud persistence if Supabase is configured
    if (isSupabaseConfigured()) {
      const cloudRes = await createCloudOpportunity(newPostData);
      if (cloudRes.success && cloudRes.post) {
        const savedPost = cloudRes.post;
        setPosts(prev => [savedPost, ...prev]);
        saveFallbackOpportunities([savedPost, ...posts]);

        // Coordination welcome message
        const welcomeMsg: Message = {
          id: `msg-${Date.now()}`,
          post_id: savedPost.id,
          sender_id: host.id,
          sender_name: host.full_name,
          sender_role: host.role,
          sender_roll: host.roll_number,
          content: `Official collaboration room created for "${savedPost.title}".`,
          created_at: new Date().toISOString(),
        };
        setMessages(prev => [...prev, welcomeMsg]);

        try {
          confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
        } catch {}

        return { success: true, post: savedPost };
      }

      // If cloud write returned an error, return it clearly to the caller
      return { success: false, error: cloudRes.error || 'Failed to save event to Supabase cloud.' };
    }

    // Local-first fallback for offline development mode
    const localPost: Post = {
      id: `post-${Date.now()}`,
      ...newPostData,
    } as Post;

    setPosts(prev => [localPost, ...prev]);
    saveFallbackOpportunities([localPost, ...posts]);

    const welcomeMsg: Message = {
      id: `msg-${Date.now()}`,
      post_id: localPost.id,
      sender_id: host.id,
      sender_name: host.full_name,
      sender_role: host.role,
      sender_roll: host.roll_number,
      content: `Official collaboration room created for "${localPost.title}".`,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, welcomeMsg]);

    try {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    } catch {}

    return { success: true, post: localPost };
  };

  // Join or apply to opportunity (Synchronized with Supabase Cloud)
  const joinPost = async (postId: string, role?: string, message?: string): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) {
      setIsAuthModalOpen(true);
      return { success: false, message: 'Please sign in to register for opportunities.' };
    }

    const post = posts.find(p => p.id === postId);
    if (!post) return { success: false, message: 'Opportunity not found.' };

    if (post.host_id === currentUser.id) {
      return { success: false, message: 'You are the organizer of this opportunity.' };
    }

    // Check if user already applied or joined
    const existingApp = applications.find(a => a.post_id === postId && a.applicant_id === currentUser.id);
    if (existingApp) {
      if (existingApp.status === 'ACCEPTED') {
        return { success: false, message: 'You are already a confirmed participant.' };
      }
      if (existingApp.status === 'PENDING') {
        return { success: false, message: 'Your application is currently pending host review.' };
      }
      if (existingApp.status === 'REJECTED') {
        return { success: false, message: 'Your previous request for this opportunity was declined.' };
      }
    }

    // Check capacity
    if (post.filled_slots >= post.total_slots) {
      return { success: false, message: 'This opportunity has reached maximum capacity.' };
    }

    const isUnlocked = post.join_mode === 'UNLOCKED';

    if (isUnlocked) {
      // Instant Join: Creates participation record with ACCEPTED status
      const appPayload: Partial<Application> = {
        post_id: postId,
        applicant_id: currentUser.id,
        applicant_name: currentUser.full_name,
        applicant_roll: currentUser.roll_number,
        applicant_dept: currentUser.department,
        applicant_year: currentUser.joining_year,
        applicant_skills: currentUser.skills,
        assigned_role: role || (post.category === 'CARPOOL' ? 'Passenger' : 'Participant'),
        status: 'ACCEPTED',
        attended: false,
        message: message || 'Joined via instant registration.',
      };

      const cloudRes = await createCloudApplication(appPayload);
      if (!cloudRes.success || !cloudRes.application) {
        return { success: false, message: cloudRes.error || 'Failed to register for this opportunity.' };
      }

      const newApp = cloudRes.application;
      const newFilled = post.filled_slots + 1;
      const newStatus = newFilled >= post.total_slots ? 'FULL' : 'OPEN';

      // Update post capacity in Supabase
      await updateCloudOpportunity(post.id, { filled_slots: newFilled, status: newStatus });

      setPosts(prev => prev.map(p => {
        if (p.id !== postId) return p;
        const updatedTargetRoles = p.target_roles?.map(tr => {
          if (role && tr.role === role && tr.filled < tr.slots) {
            return { ...tr, filled: tr.filled + 1 };
          }
          return tr;
        });
        return { ...p, filled_slots: newFilled, status: newStatus, target_roles: updatedTargetRoles };
      }));

      setApplications(prev => [newApp, ...prev.filter(a => a.id !== newApp.id)]);

      // Add join announcement to chat
      const chatNotice: Message = {
        id: `msg-${Date.now()}`,
        post_id: postId,
        sender_id: currentUser.id,
        sender_name: currentUser.full_name,
        sender_role: currentUser.role,
        sender_roll: currentUser.roll_number,
        content: `Joined the group! Ready for ${post.title}.`,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, chatNotice]);

      // Notify host
      const hostNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        user_id: post.host_id,
        type: 'APP_SUBMITTED',
        title: 'New Member Registered',
        message: `${currentUser.full_name} (${currentUser.roll_number || currentUser.department || 'Student'}) joined "${post.title}".`,
        related_post_id: post.id,
        related_post_title: post.title,
        timestamp: new Date().toISOString(),
        read: false,
      };
      setNotifications(prev => [hostNotif, ...prev]);

      try {
        confetti({ particleCount: 35, spread: 50, origin: { y: 0.6 } });
      } catch {
        // ignore
      }

      return { success: true, message: 'Registration confirmed! You have access to the group coordination chat.' };
    } else {
      // Locked: Creates participation request with PENDING status in Supabase
      const appPayload: Partial<Application> = {
        post_id: postId,
        applicant_id: currentUser.id,
        applicant_name: currentUser.full_name,
        applicant_roll: currentUser.roll_number,
        applicant_dept: currentUser.department,
        applicant_year: currentUser.joining_year,
        applicant_skills: currentUser.skills,
        assigned_role: role || 'Applicant',
        status: 'PENDING',
        attended: false,
        message: message || '',
      };

      const cloudRes = await createCloudApplication(appPayload);
      if (!cloudRes.success || !cloudRes.application) {
        return { success: false, message: cloudRes.error || 'Failed to submit application request.' };
      }

      const newApp = cloudRes.application;
      setApplications(prev => [newApp, ...prev.filter(a => a.id !== newApp.id)]);

      // Notify host
      const hostNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        user_id: post.host_id,
        type: 'APP_SUBMITTED',
        title: 'New Application Submitted',
        message: `${currentUser.full_name} submitted an application for "${post.title}".`,
        related_post_id: post.id,
        related_post_title: post.title,
        timestamp: new Date().toISOString(),
        read: false,
        action_data: { application_id: newApp.id },
      };
      setNotifications(prev => [hostNotif, ...prev]);

      return { success: true, message: 'Application submitted! Your request is pending host review.' };
    }
  };

  // Withdraw pending application or cancel accepted registration by appId
  const withdrawApplication = async (appId: string): Promise<boolean> => {
    if (!currentUser) return false;
    const app = applications.find(a => a.id === appId);
    if (!app || app.applicant_id !== currentUser.id) return false;

    const post = posts.find(p => p.id === app.post_id);
    const wasAccepted = app.status === 'ACCEPTED';

    await deleteCloudApplication(appId);
    setApplications(prev => prev.filter(a => a.id !== appId));

    if (wasAccepted && post) {
      const newFilled = Math.max(0, post.filled_slots - 1);
      const newPostStatus = newFilled < post.total_slots ? 'OPEN' : post.status;
      await updateCloudOpportunity(post.id, { filled_slots: newFilled, status: newPostStatus });
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, filled_slots: newFilled, status: newPostStatus } : p));
    }

    return true;
  };

  // Cancel Event Participation (Participant action by event ID)
  const cancelEventParticipation = async (postId: string): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) {
      return { success: false, message: 'Please sign in to manage your registrations.' };
    }

    const app = applications.find(a => a.post_id === postId && a.applicant_id === currentUser.id);
    if (!app) {
      return { success: false, message: 'No active participation or request found for this event.' };
    }

    const post = posts.find(p => p.id === postId);
    const wasAccepted = app.status === 'ACCEPTED';

    const cloudRes = await cancelCloudParticipation(postId, currentUser.id);
    if (!cloudRes.success) {
      console.warn('cancelEventParticipation cloud warning:', cloudRes.error);
    }

    setApplications(prev => prev.filter(a => a.id !== app.id));

    if (wasAccepted && post) {
      const newFilled = Math.max(0, post.filled_slots - 1);
      const newPostStatus = newFilled < post.total_slots ? 'OPEN' : post.status;
      await updateCloudOpportunity(post.id, { filled_slots: newFilled, status: newPostStatus });
      setPosts(prev => prev.map(p => p.id === post.id ? { ...p, filled_slots: newFilled, status: newPostStatus } : p));
    }

    return {
      success: true,
      message: wasAccepted
        ? 'Participation cancelled successfully. Your slot has been released.'
        : 'Your request to join has been withdrawn.',
    };
  };

  // Delete Event (Host Action)
  const deletePost = async (postId: string): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) {
      return { success: false, message: 'Please sign in to delete events.' };
    }

    const post = posts.find(p => p.id === postId);
    if (!post) {
      return { success: false, message: 'Event not found.' };
    }

    if (post.host_id !== currentUser.id && currentUser.role !== 'ADMIN') {
      return { success: false, message: 'Unauthorized: Only the host can delete this event.' };
    }

    const cloudRes = await deleteCloudOpportunity(postId);
    if (!cloudRes.success) {
      console.warn('deletePost cloud delete error:', cloudRes.error);
    }

    // Clean up local states
    setPosts(prev => prev.filter(p => p.id !== postId));
    setApplications(prev => prev.filter(a => a.post_id !== postId));
    setMessages(prev => prev.filter(m => m.post_id !== postId));

    if (selectedPostForDetail?.id === postId) {
      setSelectedPostForDetail(null);
    }
    if (selectedPostForChat?.id === postId) {
      setSelectedPostForChat(null);
    }

    return { success: true, message: `"${post.title}" has been deleted.` };
  };

  // Review Application (Host Approve / Reject with Cloud Synchronization)
  const reviewApplication = async (
    appId: string, 
    status: 'ACCEPTED' | 'REJECTED', 
    feedback?: string
  ): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) {
      return { success: false, message: 'Please sign in to manage requests.' };
    }
    const app = applications.find(a => a.id === appId);
    if (!app) {
      return { success: false, message: 'Application request not found.' };
    }
    const post = posts.find(p => p.id === app.post_id);
    if (!post) {
      return { success: false, message: 'Associated event not found.' };
    }

    // Security: Only the authorized event host can review applications
    if (!canReviewApplication(currentUser, post)) {
      return { success: false, message: 'Unauthorized: Only the host can review requests for this event.' };
    }

    // Prevent repeated decisions on an already processed request
    if (app.status !== 'PENDING') {
      return { 
        success: false, 
        message: `This request has already been ${app.status === 'ACCEPTED' ? 'approved' : 'rejected'}.` 
      };
    }

    // Persist status change to Supabase cloud
    const cloudRes = await updateCloudApplicationStatus(appId, status);
    if (!cloudRes.success) {
      return { success: false, message: cloudRes.error || 'Failed to update request status in database.' };
    }

    if (status === 'ACCEPTED') {
      const newFilled = post.filled_slots + 1;
      const newPostStatus = newFilled >= post.total_slots ? 'FULL' : 'OPEN';

      // Update post filled slots in cloud database
      await updateCloudOpportunity(post.id, { filled_slots: newFilled, status: newPostStatus });

      setPosts(prev => prev.map(p => {
        if (p.id !== post.id) return p;
        const updatedTargetRoles = p.target_roles?.map(tr => {
          if (app.assigned_role && tr.role === app.assigned_role && tr.filled < tr.slots) {
            return { ...tr, filled: tr.filled + 1 };
          }
          return tr;
        });
        return { ...p, filled_slots: newFilled, status: newPostStatus, target_roles: updatedTargetRoles };
      }));

      // Notify applicant
      const applicantNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        user_id: app.applicant_id,
        type: 'APP_APPROVED',
        title: 'Application Approved',
        message: `Your application for "${post.title}" has been approved by ${post.host_name}. You now have access to the coordination group chat.`,
        related_post_id: post.id,
        related_post_title: post.title,
        timestamp: new Date().toISOString(),
        read: false,
      };
      setNotifications(prev => [applicantNotif, ...prev]);

      // Add to group chat
      const chatNotice: Message = {
        id: `msg-${Date.now()}`,
        post_id: post.id,
        sender_id: app.applicant_id,
        sender_name: app.applicant_name,
        sender_role: 'STUDENT',
        sender_roll: app.applicant_roll,
        content: `Application approved! Ready to contribute to "${post.title}".`,
        created_at: new Date().toISOString(),
      };
      setMessages(prev => [...prev, chatNotice]);
    } else {
      // Rejection
      const applicantNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        user_id: app.applicant_id,
        type: 'APP_REJECTED',
        title: 'Application Update',
        message: `Your application for "${post.title}" was not approved at this time. ${feedback ? `Feedback: "${feedback}"` : ''}`,
        related_post_id: post.id,
        related_post_title: post.title,
        timestamp: new Date().toISOString(),
        read: false,
      };
      setNotifications(prev => [applicantNotif, ...prev]);
    }

    setApplications(prev => prev.map(a => a.id === appId ? { ...a, status } : a));
    return {
      success: true,
      message: status === 'ACCEPTED' ? 'Request approved successfully!' : 'Request rejected.'
    };
  };

  // Mark Attendance
  const markAttendance = (appId: string, attended: boolean) => {
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, attended } : a));
  };

  // Generate Verified OD Slip (strictly for authorized faculty hosts)
  const generateODSlip = (appId: string): ODSlip | null => {
    if (!currentUser) return null;
    const app = applications.find(a => a.id === appId);
    if (!app) return null;
    const post = posts.find(p => p.id === app.post_id);
    if (!post) return null;

    if (!canIssueODSlip(currentUser, post)) return null;

    const existing = odSlips.find(s => s.application_id === appId);
    if (existing) return existing;

    const eventDate = post.start_time.split('T')[0];
    const verificationHash = `OD-AMR-${new Date().getFullYear()}-CB-${Math.floor(10000 + Math.random() * 90000)}-VERIFIED`;

    const newSlip: ODSlip = {
      id: `od-slip-${Date.now()}`,
      application_id: appId,
      student_name: app.applicant_name,
      student_roll: app.applicant_roll || 'CB.EN.U4GEN24001',
      student_dept: app.applicant_dept || 'Engineering',
      student_year: app.applicant_year || 2024,
      event_id: post.id,
      event_title: post.title,
      faculty_name: post.host_name,
      faculty_designation: post.host_designation || 'Faculty In-Charge',
      faculty_dept: currentUser.department || 'Engineering',
      event_date: eventDate,
      od_hours: post.od_hours || 8,
      verification_hash: verificationHash,
      issued_at: new Date().toISOString(),
    };

    setOdSlips(prev => [newSlip, ...prev]);

    // Send notification to student
    const studentNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      user_id: app.applicant_id,
      type: 'OD_GENERATED',
      title: 'Verified OD Certificate Issued',
      message: `Your verified OD certificate for "${post.title}" has been signed by ${post.host_name}. Click to view and download your slip.`,
      related_post_id: post.id,
      related_post_title: post.title,
      timestamp: new Date().toISOString(),
      read: false,
      action_data: { od_id: newSlip.id },
    };
    setNotifications(prev => [studentNotif, ...prev]);

    try {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.5 } });
    } catch {
      // ignore
    }

    return newSlip;
  };

  // Send message to scoped group chat (Persisted to Supabase and Realtime broadcasted)
  const sendMessage = async (postId: string, content: string): Promise<boolean> => {
    if (!currentUser || !content.trim()) return false;
    const post = posts.find(p => p.id === postId);
    if (!post) return false;

    if (!canAccessChat(post, currentUser.id)) {
      return false;
    }

    const tempId = `msg-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const newMsg: Message = {
      id: tempId,
      post_id: postId,
      sender_id: currentUser.id,
      sender_name: currentUser.full_name,
      sender_role: currentUser.role,
      sender_roll: currentUser.roll_number,
      content: content.trim(),
      created_at: new Date().toISOString(),
    };

    // Optimistically update local state immediately so sender sees message without delay
    setMessages(prev => [...prev, newMsg]);

    // Persist to Supabase cloud
    const cloudRes = await sendCloudMessage(newMsg);
    if (cloudRes.success && cloudRes.message) {
      const persistedMsg = cloudRes.message;
      setMessages(prev => prev.map(m => m.id === tempId ? persistedMsg : m));

      // Broadcast to other authorized members via Realtime WebSocket
      if (supabase) {
        supabase.channel('connect-live-sync').send({
          type: 'broadcast',
          event: 'new-chat-message',
          payload: persistedMsg,
        });
      }
      return true;
    }

    return cloudRes.success;
  };

  const refreshMessages = async (postId?: string): Promise<void> => {
    try {
      const freshMsgs = await fetchCloudMessages(postId);
      if (freshMsgs && freshMsgs.length > 0) {
        setMessages(prev => {
          const map = new Map<string, Message>();
          prev.forEach(m => map.set(m.id, m));
          freshMsgs.forEach(m => map.set(m.id, m));
          return Array.from(map.values()).sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        });
      }
    } catch (err) {
      console.warn('refreshMessages error:', err);
    }
  };

  // Invite student to post from Find People Directory
  const inviteUserToPost = (targetUserId: string, postId: string, note?: string): boolean => {
    if (!currentUser) return false;
    const post = posts.find(p => p.id === postId);
    const targetUser = allUsers.find(u => u.id === targetUserId);
    if (!post || !targetUser) return false;

    const notif: NotificationItem = {
      id: `notif-${Date.now()}`,
      user_id: targetUserId,
      type: 'INVITE_RECEIVED',
      title: 'Direct Event Invitation',
      message: `${currentUser.full_name} invited you to collaborate on "${post.title}". ${note ? `Note: "${note}"` : ''}`,
      related_post_id: post.id,
      related_post_title: post.title,
      timestamp: new Date().toISOString(),
      read: false,
      action_data: { invite_id: `inv-${Date.now()}` },
    };

    setNotifications(prev => [notif, ...prev]);
    return true;
  };

  const acceptInvite = (notificationId: string, postId: string) => {
    joinPost(postId);
    markNotificationRead(notificationId);
  };

  const declineInvite = (notificationId: string) => {
    markNotificationRead(notificationId);
  };

  const markNotificationRead = (notifId: string) => {
    setNotifications(prev => prev.map(n => n.id === notifId ? { ...n, read: true } : n));
  };

  const markAllNotificationsRead = () => {
    if (!currentUser) return;
    setNotifications(prev => prev.map(n => n.user_id === currentUser.id ? { ...n, read: true } : n));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
        isAuthenticated: Boolean(currentUser),
        allUsers,
        posts,
        applications,
        messages,
        notifications,
        odSlips,
        landmarks,
        calendarItems,
        activeTab,
        setActiveTab,
        theme,
        setTheme,
        toggleTheme,
        selectedPostForDetail,
        setSelectedPostForDetail,
        selectedPostForChat,
        setSelectedPostForChat,
        selectedODSlipForView,
        setSelectedODSlipForView,
        isCreatePostModalOpen,
        setIsCreatePostModalOpen,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        isProfileModalOpen,
        setIsProfileModalOpen,
        isMapModalOpen,
        setIsMapModalOpen,
        isSupabaseActive: isSupabaseConfigured(),
        isCloudConnected,
        refreshEvents,
        refreshApplications,
        refreshMessages,
        selectedCategoryFilter,
        setSelectedCategoryFilter,
        registerNewAccount,
        loginExistingAccount,
        signOutUser,
        updateCurrentUserProfile,
        createPost,
        deletePost,
        cancelEventParticipation,
        joinPost,
        withdrawApplication,
        reviewApplication,
        markAttendance,
        generateODSlip,
        sendMessage,
        inviteUserToPost,
        acceptInvite,
        declineInvite,
        markNotificationRead,
        markAllNotificationsRead,
        checkScheduleClash,
        canAccessChat,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
