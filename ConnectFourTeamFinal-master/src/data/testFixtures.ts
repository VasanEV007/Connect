import { UserProfile, Post } from '../types';

/**
 * Dedicated test fixtures for automated testing suites (vitest).
 * These fixtures are strictly isolated in test files and NEVER injected
 * into the production user experience or database.
 */

export const TEST_STUDENT: UserProfile = {
  id: 'test-student-1',
  full_name: 'Test Student',
  email: 'student@cb.students.amrita.edu',
  role: 'STUDENT',
  roll_number: 'CB.EN.U4CSE23001',
  department: 'Computer Science and Engineering',
  joining_year: 2023,
  skills: ['React', 'TypeScript'],
  interests: ['Hackathons'],
};

export const TEST_FACULTY: UserProfile = {
  id: 'test-faculty-1',
  full_name: 'Dr. Test Professor',
  email: 'faculty@cb.amrita.edu',
  role: 'FACULTY',
  department: 'Automation and Robotics Engineering',
  designation: 'Professor',
  skills: ['ROS2', 'Control Systems'],
  interests: ['Autonomous UAVs'],
};

export const TEST_POST: Post = {
  id: 'test-post-1',
  host_id: 'test-faculty-1',
  host_name: 'Dr. Test Professor',
  host_role: 'FACULTY',
  title: 'Test Robotics Lab Workshop',
  description: 'Hands-on evaluation session on kinematics and SLAM in Robotics Lab.',
  category: 'FACULTY_WORKSHOP',
  join_mode: 'UNLOCKED',
  status: 'OPEN',
  total_slots: 10,
  filled_slots: 0,
  required_skills: ['ROS2'],
  eligible_departments: ['ANY'],
  eligible_years: [2023, 2024],
  venue_name: 'Academic Block 1 (AB1) - Robotics Lab',
  start_time: '2026-10-22T09:00:00Z',
  end_time: '2026-10-22T17:00:00Z',
  od_available: true,
  od_hours: 8,
  created_at: '2026-10-10T00:00:00Z',
};
