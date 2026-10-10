import { describe, it, expect } from 'vitest';
import { 
  isFacultyUser, 
  canAccessFacultyPortal,
  isPostHost, 
  canReviewApplication, 
  canIssueODSlip, 
  canAccessScopedChat,
  normalizeRole
} from './security';
import { UserProfile, Post, Application } from '../types';

describe('security utility', () => {
  const studentUser: UserProfile = {
    id: 'user-student-1',
    full_name: 'Aditi Krishnan',
    email: 'aditi.k@cb.students.amrita.edu',
    role: 'STUDENT',
    skills: ['React', 'TypeScript'],
    interests: ['Robotics'],
  };

  const facultyUser: UserProfile = {
    id: 'user-faculty-1',
    full_name: 'Dr. Radhika Menon',
    email: 'radhika@amrita.edu',
    role: 'FACULTY',
    skills: ['ROS2'],
    interests: ['UAV'],
  };

  const adminUser: UserProfile = {
    id: 'user-admin-1',
    full_name: 'System Admin',
    email: 'admin@amrita.edu',
    role: 'ADMIN',
    skills: ['Security'],
    interests: ['Infrastructure'],
  };

  const facultyPost: Post = {
    id: 'post-1',
    host_id: 'user-faculty-1',
    host_name: 'Dr. Radhika Menon',
    host_role: 'FACULTY',
    title: 'Drone Research Assistantship',
    description: 'Autonomous drone research project looking for flight control engineers.',
    category: 'FACULTY_RESEARCH',
    join_mode: 'LOCKED',
    status: 'OPEN',
    total_slots: 4,
    filled_slots: 1,
    required_skills: ['ROS2'],
    eligible_departments: ['ANY'],
    eligible_years: [2024],
    venue_name: 'Lab 304',
    start_time: '2026-10-18T14:00:00Z',
    end_time: '2026-10-18T17:00:00Z',
    od_available: true,
    created_at: '2026-10-09T00:00:00Z',
  };

  const applications: Application[] = [
    {
      id: 'app-1',
      post_id: 'post-1',
      applicant_id: 'user-student-1',
      applicant_name: 'Aditi Krishnan',
      applicant_skills: ['React'],
      status: 'ACCEPTED',
      attended: true,
      created_at: '2026-10-10T00:00:00Z',
    },
    {
      id: 'app-2',
      post_id: 'post-1',
      applicant_id: 'user-student-2',
      applicant_name: 'Vignesh K',
      applicant_skills: ['IoT'],
      status: 'PENDING',
      attended: false,
      created_at: '2026-10-10T00:00:00Z',
    },
  ];

  it('correctly validates faculty vs student vs admin roles', () => {
    expect(isFacultyUser(facultyUser)).toBe(true);
    expect(isFacultyUser(adminUser)).toBe(true);
    expect(isFacultyUser(studentUser)).toBe(false);
    expect(isFacultyUser(null)).toBe(false);
  });

  it('strictly restricts faculty portal access to faculty and admin only', () => {
    expect(canAccessFacultyPortal(facultyUser)).toBe(true);
    expect(canAccessFacultyPortal(adminUser)).toBe(true);
    expect(canAccessFacultyPortal(studentUser)).toBe(false);
    expect(canAccessFacultyPortal(null)).toBe(false);
  });

  it('normalizes roles safely', () => {
    expect(normalizeRole('faculty')).toBe('FACULTY');
    expect(normalizeRole('FACULTY')).toBe('FACULTY');
    expect(normalizeRole('admin')).toBe('ADMIN');
    expect(normalizeRole('student')).toBe('STUDENT');
    expect(normalizeRole(undefined)).toBe('STUDENT');
  });

  it('verifies post host authorization', () => {
    expect(isPostHost(facultyUser, facultyPost)).toBe(true);
    expect(isPostHost(studentUser, facultyPost)).toBe(false);
  });

  it('allows application review only for the post host', () => {
    expect(canReviewApplication(facultyUser, facultyPost)).toBe(true);
    expect(canReviewApplication(studentUser, facultyPost)).toBe(false);
  });

  it('permits OD certificate issuance ONLY for verified faculty hosts', () => {
    // Faculty host -> ALLOWED
    expect(canIssueODSlip(facultyUser, facultyPost)).toBe(true);

    // Student -> DENIED
    expect(canIssueODSlip(studentUser, facultyPost)).toBe(false);

    // Another faculty member who is NOT host -> DENIED
    const anotherFaculty: UserProfile = { ...facultyUser, id: 'user-faculty-2' };
    expect(canIssueODSlip(anotherFaculty, facultyPost)).toBe(false);
  });

  it('governs scoped group chat access accurately', () => {
    // 1. Host has full chat access
    expect(canAccessScopedChat(facultyUser, facultyPost, applications)).toBe(true);

    // 2. Confirmed (ACCEPTED) participant has chat access
    expect(canAccessScopedChat(studentUser, facultyPost, applications)).toBe(true);

    // 3. PENDING applicant does NOT have chat access
    const pendingStudent: UserProfile = { ...studentUser, id: 'user-student-2' };
    expect(canAccessScopedChat(pendingStudent, facultyPost, applications)).toBe(false);

    // 4. Non-applicant student does NOT have chat access
    const strangerStudent: UserProfile = { ...studentUser, id: 'user-stranger' };
    expect(canAccessScopedChat(strangerStudent, facultyPost, applications)).toBe(false);
  });
});
