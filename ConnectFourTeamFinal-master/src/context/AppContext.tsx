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
  SEED_PROFILES, 
  SEED_POSTS, 
  SEED_APPLICATIONS, 
  SEED_MESSAGES, 
  SEED_NOTIFICATIONS, 
  SEED_OD_SLIPS, 
  CAMPUS_LANDMARKS, 
  ACADEMIC_CALENDAR_ITEMS 
} from '../data/seedData';
import { detectScheduleClash, ClashDetail } from '../utils/clashDetector';
import { canAccessScopedChat, canReviewApplication, canIssueODSlip } from '../utils/security';

export type NavigationTab = 'feed' | 'find-people' | 'calendar' | 'carpool' | 'faculty-portal' | 'my-activities';

interface AppContextType {
  currentUser: UserProfile;
  setCurrentUser: (user: UserProfile) => void;
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
  isMapModalOpen: boolean;
  setIsMapModalOpen: (open: boolean) => void;
  
  // Actions
  createPost: (postData: Partial<Post>) => Post;
  joinPost: (postId: string, role?: string, message?: string) => Promise<{ success: boolean; message: string }>;
  withdrawApplication: (appId: string) => boolean;
  reviewApplication: (appId: string, status: 'ACCEPTED' | 'REJECTED', feedback?: string) => void;
  markAttendance: (appId: string, attended: boolean) => void;
  generateODSlip: (appId: string) => ODSlip | null;
  sendMessage: (postId: string, content: string) => boolean;
  inviteUserToPost: (targetUserId: string, postId: string, note?: string) => boolean;
  acceptInvite: (notificationId: string, postId: string) => void;
  declineInvite: (notificationId: string) => void;
  markNotificationRead: (notifId: string) => void;
  markAllNotificationsRead: () => void;
  registerUser: (newUser: UserProfile) => void;
  updateCurrentUserProfile: (updates: Partial<UserProfile>) => void;
  checkScheduleClash: (startTime: string, endTime: string, currentPostId?: string) => ClashDetail;
  canAccessChat: (post: Post | null, userId?: string) => boolean;
  resetToSampleData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEYS = {
  CURRENT_USER: 'campusconnect_current_user_v2',
  PROFILES: 'campusconnect_profiles_v2',
  POSTS: 'campusconnect_posts_v2',
  APPLICATIONS: 'campusconnect_applications_v2',
  MESSAGES: 'campusconnect_messages_v2',
  NOTIFICATIONS: 'campusconnect_notifications_v2',
  OD_SLIPS: 'campusconnect_od_slips_v2',
};

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Profiles
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROFILES);
    return saved ? JSON.parse(saved) : SEED_PROFILES;
  });

  // Current logged in user (Default to Arjun Nair)
  const [currentUser, setCurrentUserState] = useState<UserProfile>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return saved ? JSON.parse(saved) : SEED_PROFILES[0];
  });

  // Posts
  const [posts, setPosts] = useState<Post[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.POSTS);
    return saved ? JSON.parse(saved) : SEED_POSTS;
  });

  // Applications
  const [applications, setApplications] = useState<Application[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.APPLICATIONS);
    return saved ? JSON.parse(saved) : SEED_APPLICATIONS;
  });

  // Messages
  const [messages, setMessages] = useState<Message[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.MESSAGES);
    return saved ? JSON.parse(saved) : SEED_MESSAGES;
  });

  // Notifications
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
    return saved ? JSON.parse(saved) : SEED_NOTIFICATIONS;
  });

  // OD Slips
  const [odSlips, setOdSlips] = useState<ODSlip[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.OD_SLIPS);
    return saved ? JSON.parse(saved) : SEED_OD_SLIPS;
  });

  // Landmarks & Calendar items (static/read-only)
  const [landmarks] = useState<CampusLandmark[]>(CAMPUS_LANDMARKS);
  const [calendarItems] = useState<AcademicCalendarItem[]>(ACADEMIC_CALENDAR_ITEMS);

  // Active navigation tab
  const [activeTab, setActiveTab] = useState<NavigationTab>('feed');

  // Modals
  const [selectedPostForDetail, setSelectedPostForDetail] = useState<Post | null>(null);
  const [selectedPostForChat, setSelectedPostForChat] = useState<Post | null>(null);
  const [selectedODSlipForView, setSelectedODSlipForView] = useState<ODSlip | null>(null);
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isMapModalOpen, setIsMapModalOpen] = useState(false);

  // Sync state changes to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(currentUser));
  }, [currentUser]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROFILES, JSON.stringify(allUsers));
  }, [allUsers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.POSTS, JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.APPLICATIONS, JSON.stringify(applications));
  }, [applications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
  }, [messages]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
  }, [notifications]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.OD_SLIPS, JSON.stringify(odSlips));
  }, [odSlips]);

  const setCurrentUser = (user: UserProfile) => {
    setCurrentUserState(user);
  };

  const updateCurrentUserProfile = (updates: Partial<UserProfile>) => {
    const updated = { ...currentUser, ...updates };
    setCurrentUserState(updated);
    setAllUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
  };

  const registerUser = (newUser: UserProfile) => {
    setAllUsers(prev => [newUser, ...prev]);
    setCurrentUserState(newUser);
  };

  const resetToSampleData = () => {
    localStorage.clear();
    setAllUsers(SEED_PROFILES);
    setCurrentUserState(SEED_PROFILES[0]);
    setPosts(SEED_POSTS);
    setApplications(SEED_APPLICATIONS);
    setMessages(SEED_MESSAGES);
    setNotifications(SEED_NOTIFICATIONS);
    setOdSlips(SEED_OD_SLIPS);
  };

  // Clash detection using clashDetector utility
  const checkScheduleClash = (startTimeStr: string, endTimeStr: string, currentPostId?: string): ClashDetail => {
    return detectScheduleClash(
      startTimeStr,
      endTimeStr,
      calendarItems,
      posts,
      applications,
      currentUser.id,
      currentPostId
    );
  };

  // Permission check for scoped group chat: only host + accepted applicants
  const canAccessChat = (post: Post | null, userId?: string): boolean => {
    if (!post) return false;
    const user = (userId ? allUsers.find(u => u.id === userId) : null) || currentUser || null;
    return canAccessScopedChat(user, post, applications);
  };

  // Create post
  const createPost = (postData: Partial<Post>): Post => {
    const newPost: Post = {
      id: `post-${Date.now()}`,
      host_id: currentUser.id,
      host_name: currentUser.full_name,
      host_role: currentUser.role,
      host_avatar: currentUser.avatar_url,
      host_designation: currentUser.designation,
      title: postData.title || 'Untitled Activity',
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
      target_roles: postData.target_roles || [],
      created_at: new Date().toISOString(),
    };

    setPosts(prev => [newPost, ...prev]);

    // Instantiate initial system welcome chat message
    const welcomeMsg: Message = {
      id: `msg-${Date.now()}`,
      post_id: newPost.id,
      sender_id: currentUser.id,
      sender_name: currentUser.full_name,
      sender_role: currentUser.role,
      sender_roll: currentUser.roll_number,
      content: `Welcome team! Official coordination room created for "${newPost.title}".`,
      created_at: new Date().toISOString(),
    };
    setMessages(prev => [...prev, welcomeMsg]);

    try {
      confetti({ particleCount: 30, spread: 50, origin: { y: 0.7 } });
    } catch {
      // Ignore if confetti not supported
    }

    return newPost;
  };

  // Join or apply to post
  const joinPost = async (postId: string, role?: string, message?: string): Promise<{ success: boolean; message: string }> => {
    const post = posts.find(p => p.id === postId);
    if (!post) return { success: false, message: 'Event not found.' };

    if (post.host_id === currentUser.id) {
      return { success: false, message: 'You are the host of this opportunity.' };
    }

    // Check if user already applied or joined
    const existingApp = applications.find(a => a.post_id === postId && a.applicant_id === currentUser.id);
    if (existingApp) {
      if (existingApp.status === 'ACCEPTED') {
        return { success: false, message: 'You are already a confirmed member of this activity.' };
      }
      if (existingApp.status === 'PENDING') {
        return { success: false, message: 'Your application is already pending host review.' };
      }
    }

    // Check capacity
    if (post.filled_slots >= post.total_slots) {
      return { success: false, message: 'This opportunity has reached maximum capacity.' };
    }

    const isUnlocked = post.join_mode === 'UNLOCKED';

    if (isUnlocked) {
      // Instant Join
      const newApp: Application = {
        id: `app-${Date.now()}`,
        post_id: postId,
        applicant_id: currentUser.id,
        applicant_name: currentUser.full_name,
        applicant_roll: currentUser.roll_number,
        applicant_dept: currentUser.department,
        applicant_year: currentUser.joining_year,
        applicant_avatar: currentUser.avatar_url,
        applicant_skills: currentUser.skills,
        assigned_role: role || (post.category === 'CARPOOL' ? 'Passenger' : 'Participant'),
        status: 'ACCEPTED',
        attended: false,
        message: message || 'Joined via instant registration.',
        created_at: new Date().toISOString(),
      };

      // Increment filled slots
      const newFilled = post.filled_slots + 1;
      const newStatus = newFilled >= post.total_slots ? 'FULL' : 'OPEN';

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

      setApplications(prev => [newApp, ...prev]);

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

      return { success: true, message: 'Registration confirmed! You have been granted access to the group chat.' };
    } else {
      // Locked: Request to Join
      const newApp: Application = {
        id: `app-${Date.now()}`,
        post_id: postId,
        applicant_id: currentUser.id,
        applicant_name: currentUser.full_name,
        applicant_roll: currentUser.roll_number,
        applicant_dept: currentUser.department,
        applicant_year: currentUser.joining_year,
        applicant_avatar: currentUser.avatar_url,
        applicant_skills: currentUser.skills,
        assigned_role: role || 'Applicant',
        status: 'PENDING',
        attended: false,
        message: message || '',
        created_at: new Date().toISOString(),
      };

      setApplications(prev => [newApp, ...prev]);

      // Notify host
      const hostNotif: NotificationItem = {
        id: `notif-${Date.now()}`,
        user_id: post.host_id,
        type: 'APP_SUBMITTED',
        title: 'New Application Submitted',
        message: `${currentUser.full_name} (${currentUser.roll_number || 'Student'}) submitted an application for "${post.title}" (${role || 'General'}).`,
        related_post_id: post.id,
        related_post_title: post.title,
        timestamp: new Date().toISOString(),
        read: false,
        action_data: { application_id: newApp.id },
      };
      setNotifications(prev => [hostNotif, ...prev]);

      return { success: true, message: 'Application submitted! The host has been notified to review your profile.' };
    }
  };

  // Withdraw pending application
  const withdrawApplication = (appId: string): boolean => {
    const app = applications.find(a => a.id === appId);
    if (!app || app.applicant_id !== currentUser.id) return false;

    // Remove application
    setApplications(prev => prev.filter(a => a.id !== appId));
    return true;
  };

  // Review Application (Approve / Reject)
  const reviewApplication = (appId: string, status: 'ACCEPTED' | 'REJECTED', feedback?: string) => {
    const app = applications.find(a => a.id === appId);
    if (!app) return;
    const post = posts.find(p => p.id === app.post_id);
    if (!post) return;

    // Verify permission
    if (!canReviewApplication(currentUser, post)) return;

    if (status === 'ACCEPTED') {
      const newFilled = post.filled_slots + 1;
      const newPostStatus = newFilled >= post.total_slots ? 'FULL' : 'OPEN';

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
        message: `Your application for "${post.title}" has been approved by ${post.host_name}. You now have full access to the coordination group chat.`,
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
  };

  // Mark Attendance
  const markAttendance = (appId: string, attended: boolean) => {
    setApplications(prev => prev.map(a => a.id === appId ? { ...a, attended } : a));
  };

  // Generate Verified OD Slip
  const generateODSlip = (appId: string): ODSlip | null => {
    const app = applications.find(a => a.id === appId);
    if (!app) return null;
    const post = posts.find(p => p.id === app.post_id);
    if (!post) return null;

    // Check authorization: must be faculty host
    if (!canIssueODSlip(currentUser, post)) return null;

    // Check if OD slip already exists for this application
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
      title: 'Official OD Certificate Issued',
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

  // Send message to scoped group chat
  const sendMessage = (postId: string, content: string): boolean => {
    if (!content.trim()) return false;
    const post = posts.find(p => p.id === postId);
    if (!post) return false;

    // Check permission
    if (!canAccessChat(post, currentUser.id)) {
      return false;
    }

    const newMsg: Message = {
      id: `msg-${Date.now()}`,
      post_id: postId,
      sender_id: currentUser.id,
      sender_name: currentUser.full_name,
      sender_role: currentUser.role,
      sender_roll: currentUser.roll_number,
      sender_avatar: currentUser.avatar_url,
      content: content.trim(),
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, newMsg]);
    return true;
  };

  // Manual Invite student to post from Find People Directory
  const inviteUserToPost = (targetUserId: string, postId: string, note?: string): boolean => {
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
    setNotifications(prev => prev.map(n => n.user_id === currentUser.id ? { ...n, read: true } : n));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser,
        setCurrentUser,
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
        isMapModalOpen,
        setIsMapModalOpen,
        createPost,
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
        registerUser,
        updateCurrentUserProfile,
        checkScheduleClash,
        canAccessChat,
        resetToSampleData,
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
