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

/**
 * PRODUCTION CONNECT REGISTRY:
 * All user profiles, opportunities, registrations, chats, and OD records
 * are populated strictly by real registered users or fetched from Supabase.
 * No preset fake people or fabricated user activity.
 */

export const SEED_PROFILES: UserProfile[] = [];

export const SEED_POSTS: Post[] = [];

export const SEED_APPLICATIONS: Application[] = [];

export const SEED_MESSAGES: Message[] = [];

export const SEED_NOTIFICATIONS: NotificationItem[] = [];

export const SEED_OD_SLIPS: ODSlip[] = [];

/**
 * Amrita Vishwa Vidyapeetham, Ettimadai Campus physical landmarks
 * for interactive Campus Navigator map.
 */
export const CAMPUS_LANDMARKS: CampusLandmark[] = [
  {
    id: 'lm-ab1',
    name: 'Academic Block 1 (AB1)',
    short_code: 'AB1',
    category: 'ACADEMIC',
    x_percent: 32,
    y_percent: 42,
    description: 'Home to Department of Automation and Robotics Engineering, Mechanical Engineering, and specialized robotics & CAD simulation labs.',
    popular_for: ['Robotics Labs', 'ARE Department Office', 'Lecture Halls 101-118'],
  },
  {
    id: 'lm-ab2',
    name: 'Academic Block 2 (AB2)',
    short_code: 'AB2',
    category: 'ACADEMIC',
    x_percent: 44,
    y_percent: 38,
    description: 'Department of Electronics & Communication Engineering (ECE) and Electrical & Electronics Engineering (EEE). VLSI & Embedded systems center.',
    popular_for: ['DSP Labs', 'Circuit Design Center', 'Seminar Hall 2'],
  },
  {
    id: 'lm-ab3',
    name: 'Academic Block 3 (AB3)',
    short_code: 'AB3',
    category: 'ACADEMIC',
    x_percent: 58,
    y_percent: 40,
    description: 'Flagship Computing block housing Computer Science & Engineering (CSE), AI & Data Science (AI&DS), and Cyber Security research centers.',
    popular_for: ['High Performance Computing Lab', 'TIFAC-CORE Cyber Security', 'FOSS Club Room'],
  },
  {
    id: 'lm-library',
    name: 'Central Library & Learning Resource Center',
    short_code: 'LIB',
    category: 'HALL',
    x_percent: 48,
    y_percent: 52,
    description: 'Four-story digital and print repository with 60,000+ volumes, IEEE digital access rooms, group study hubs, and quiet research carrels.',
    popular_for: ['Digital Library', 'Quiet Study Zone', 'Journal Archives'],
  },
  {
    id: 'lm-main-hall',
    name: 'Sudhamani Auditorium',
    short_code: 'AUD',
    category: 'HALL',
    x_percent: 38,
    y_percent: 60,
    description: '3,000-seat university convention auditorium for national hackathons, Anokha inaugurals, convocations, and guest lectures.',
    popular_for: ['Hackathon Finales', 'Tech Fests', 'University Convocations'],
  },
  {
    id: 'lm-sports',
    name: 'Amrita Sports Complex & Synthetic Courts',
    short_code: 'SPORTS',
    category: 'SPORTS',
    x_percent: 72,
    y_percent: 68,
    description: 'Olympic-sized athletics track, indoor wooden badminton courts, basketball arena, and Olympic swimming facility.',
    popular_for: ['Badminton Arena', 'Swimming Pool', 'Gymnasium & Fitness Club'],
  },
  {
    id: 'lm-main-gate',
    name: 'Campus Main Gate (Gate 1 - Coimbatore Highway)',
    short_code: 'GATE1',
    category: 'GATE',
    x_percent: 12,
    y_percent: 85,
    description: 'Primary campus access control point facing NH 544. Official pickup point for city carpools, buses, and registered cabs.',
    popular_for: ['Carpool Pickup Bay', 'Amrita Shuttle Service', 'Auto Stand'],
  },
  {
    id: 'lm-canteen',
    name: 'Central Food Court & Amriteshwari Canteen',
    short_code: 'CAFE',
    category: 'FOOD',
    x_percent: 54,
    y_percent: 62,
    description: 'Main campus dining hall serving wholesome south Indian meals, juice corner, and evening student snack cafeteria.',
    popular_for: ['Fresh Juices', 'Study Snacks', 'Post-Event Hangouts'],
  },
];

/**
 * Official semester calendar items for Amrita Vishwa Vidyapeetham
 */
export const ACADEMIC_CALENDAR_ITEMS: AcademicCalendarItem[] = [
  {
    id: 'cal-1',
    title: 'Mid-Term Assessment 2 (Theory Exams)',
    event_date: '2026-10-15',
    end_date: '2026-10-17',
    event_type: 'EXAM',
    description: 'B.Tech Semesters 3, 5 & 7 Continuous Evaluation Mid-Term 2 examinations.',
    color: '#ef4444',
  },
  {
    id: 'cal-2',
    title: 'Ayudha Pooja & Vijayadashami University Holiday',
    event_date: '2026-10-20',
    end_date: '2026-10-21',
    event_type: 'HOLIDAY',
    description: 'Official university holiday across all Amrita campuses.',
    color: '#10b981',
  },
  {
    id: 'cal-3',
    title: 'Anokha 2026 Tech Fest: National Technical Symposium',
    event_date: '2026-10-25',
    end_date: '2026-10-27',
    event_type: 'COLLEGE_EVENT',
    description: 'Flagship national college tech fest. 70+ workshops, coding contests, and guest lectures.',
    color: '#8b5cf6',
  },
  {
    id: 'cal-4',
    title: 'Diwali Institutional Break',
    event_date: '2026-11-01',
    end_date: '2026-11-03',
    event_type: 'HOLIDAY',
    description: 'Campus closed for Diwali festivities.',
    color: '#10b981',
  },
  {
    id: 'cal-5',
    title: 'End-Semester Practical Laboratory Examinations',
    event_date: '2026-11-16',
    end_date: '2026-11-20',
    event_type: 'EXAM',
    description: 'Final department lab viva and evaluation.',
    color: '#ef4444',
  },
];
