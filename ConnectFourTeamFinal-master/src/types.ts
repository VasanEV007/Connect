export type UserRole = 'STUDENT' | 'FACULTY' | 'ADMIN';

export type PostCategory = 
  | 'STUDENT_CASUAL' 
  | 'STUDENT_CREATIVE' 
  | 'CARPOOL' 
  | 'FACULTY_WORKSHOP' 
  | 'FACULTY_RESEARCH' 
  | 'FACULTY_VOLUNTEER';

export type JoinMode = 'UNLOCKED' | 'LOCKED';
export type PostStatus = 'OPEN' | 'FULL' | 'COMPLETED' | 'CANCELLED';
export type ApplicationStatus = 'PENDING' | 'ACCEPTED' | 'REJECTED' | 'INVITED';
export type CalendarEventType = 'HOLIDAY' | 'EXAM' | 'COLLEGE_EVENT' | 'REGISTERED_ACTIVITY' | 'HOSTED_EVENT';

export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  role: UserRole;
  roll_number?: string;
  department?: string;
  joining_year?: number;
  gender?: 'Male' | 'Female' | 'Other' | 'Prefer not to say';
  bio?: string;
  portfolio_url?: string;
  github_url?: string;
  linkedin_url?: string;
  skills: string[];
  interests: string[];
  designation?: string; // Faculty designation (e.g. Assistant Professor)
  cabin_or_lab?: string; // Faculty office or lab
  is_verified?: boolean; // Institutional verification flag
  created_at?: string;
}

export interface ParsedRollNumber {
  campusCode: string;
  campusName: string;
  schoolCode: string;
  schoolName: string;
  degreeCode: string;
  degreeName: string;
  deptCode: string;
  deptName: string;
  joiningYear: number;
  currentYearStudy: number;
  rollId: string;
  isValid: boolean;
  rawInput: string;
}

export interface TargetRoleSlot {
  role: string;
  slots: number;
  filled: number;
}

export interface Post {
  id: string;
  host_id: string;
  host_name: string;
  host_role: UserRole;
  host_designation?: string;
  title: string;
  description: string;
  instructions?: string;
  category: PostCategory;
  join_mode: JoinMode;
  status: PostStatus;
  total_slots: number;
  filled_slots: number;
  required_skills: string[];
  eligible_departments: string[];
  eligible_years: number[];
  venue_name: string;
  map_lat?: number;
  map_lng?: number;
  start_time: string; // ISO string
  end_time: string;   // ISO string
  od_available: boolean;
  od_details?: string;
  od_hours?: number;
  research_perks?: string;
  weekly_commitment_hours?: number;
  // Carpool / Travel fields
  carpool_destination?: string;
  carpool_origin?: string;
  carpool_cost_split?: string;
  carpool_gender_pref?: 'ANY' | 'FEMALE_ONLY' | 'MALE_ONLY';
  carpool_seats_available?: number;
  carpool_notes?: string;
  target_roles?: TargetRoleSlot[];
  created_at: string;
}

export interface Application {
  id: string;
  post_id: string;
  applicant_id: string;
  applicant_name: string;
  applicant_roll?: string;
  applicant_dept?: string;
  applicant_year?: number;
  applicant_skills: string[];
  assigned_role?: string;
  status: ApplicationStatus;
  attended: boolean;
  message?: string;
  created_at: string;
}

export interface Message {
  id: string;
  post_id: string;
  sender_id: string;
  sender_name: string;
  sender_role: UserRole;
  sender_roll?: string;
  content: string;
  created_at: string;
}

export type NotificationType = 
  | 'APP_SUBMITTED' 
  | 'APP_APPROVED' 
  | 'APP_REJECTED' 
  | 'INVITE_RECEIVED' 
  | 'SLOT_FULL' 
  | 'OD_GENERATED' 
  | 'EVENT_REMINDER';

export interface NotificationItem {
  id: string;
  user_id: string;
  type: NotificationType;
  title: string;
  message: string;
  related_post_id?: string;
  related_post_title?: string;
  timestamp: string;
  read: boolean;
  action_data?: {
    invite_id?: string;
    application_id?: string;
    od_id?: string;
  };
}

export interface ODSlip {
  id: string;
  application_id: string;
  student_name: string;
  student_roll: string;
  student_dept: string;
  student_year: number;
  event_id: string;
  event_title: string;
  faculty_name: string;
  faculty_designation: string;
  faculty_dept: string;
  event_date: string;
  od_hours: number;
  verification_hash: string;
  issued_at: string;
}

export interface CampusLandmark {
  id: string;
  name: string;
  short_code: string;
  category: 'ACADEMIC' | 'HALL' | 'SPORTS' | 'HOSTEL' | 'FOOD' | 'GATE';
  x_percent: number; // 0 - 100 on interactive floorplan
  y_percent: number; // 0 - 100 on interactive floorplan
  description: string;
  popular_for: string[];
}

export interface AcademicCalendarItem {
  id: string;
  title: string;
  event_date: string; // YYYY-MM-DD
  end_date?: string;   // YYYY-MM-DD
  event_type: CalendarEventType;
  description?: string;
  department?: string;
  color?: string;
}
