import { describe, it, expect } from 'vitest';
import { 
  isFacultyUser, 
  isPostHost, 
  canReviewApplication, 
  canIssueODSlip, 
  canAccessScopedChat 
} from './security';
import { UserProfile, Post, Application } from '../types';

describe('security utility', () => {
  const studentUser: UserProfile = {
    id: 'user-arjun',
    full_name: 'Arjun Nair',
    email: 'arjun@amrita.edu',
    role: 'STUDENT',
    skills: ['React'],
    interests: ['Robotics'],
  };

  const facultyUser: UserProfile = {
    id: 'user-dr-radhika',
    full_name: 'Dr. Radhika Menon',
    email: 'radhika@amrita.edu',
    role: 'FACULTY',
    skills: ['ROS2'],
    interests: ['UAV'],
  };

  const facultyPost: Post = {
    id: 'post-1',
    host_id: 'user-dr-radhika',
    host_name: 'Dr. Radhika Menon',
    host_role: 'FACULTY',
    title: 'Drone Research',
    description: 'Autonomous drone research',
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
      applicant_id: 'user-arjun',
      applicant_name: 'Arjun Nair',
      applicant_skills: ['React'],
      status: 'ACCEPTED',
      attended: true,
      created_at: '2026-10-10T00:00:00Z',
    },
    {
      id: 'app-2',
      post_id: 'post-1',
      applicant_id: 'user-vignesh',
      applicant_name: 'Vignesh K',
      applicant_skills: ['IoT'],
      status: 'PENDING',
      attended: false,
      created_at: '2026-10-10T00:00:00Z',
    },
  ];

  it('correctly validates faculty vs student roles', () => {
    expect(isFacultyUser(facultyUser)).toBe(true);
    expect(isFacultyUser(studentUser)).toBe(false);
    expect(isFacultyUser(null)).toBe(false);
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

    // Student (even if student were host of another event) -> DENIED
    expect(canIssueODSlip(studentUser, facultyPost)).toBe(false);

    // Another faculty member who is NOT host -> DENIED
    const anotherFaculty: UserProfile = { ...facultyUser, id: 'user-dr-ramesh' };
    expect(canIssueODSlip(anotherFaculty, facultyPost)).toBe(false);
  });

  it('governs scoped group chat access accurately', () => {
    // 1. Host has full chat access
    expect(canAccessScopedChat(facultyUser, facultyPost, applications)).toBe(true);

    // 2. Confirmed (ACCEPTED) participant has chat access
    expect(canAccessScopedChat(studentUser, facultyPost, applications)).toBe(true);

    // 3. PENDING applicant does NOT have chat access
    const pendingStudent: UserProfile = { ...studentUser, id: 'user-vignesh' };
    expect(canAccessScopedChat(pendingStudent, facultyPost, applications)).toBe(false);

    // 4. Non-applicant student does NOT have chat access
    const strangerStudent: UserProfile = { ...studentUser, id: 'user-stranger' };
    expect(canAccessScopedChat(strangerStudent, facultyPost, applications)).toBe(false);
  });
});
