import { describe, it, expect } from 'vitest';
import { detectScheduleClash } from './clashDetector';
import { AcademicCalendarItem, Post, Application } from '../types';

describe('clashDetector utility', () => {
  const sampleCalendarItems: AcademicCalendarItem[] = [
    {
      id: 'cal-exam-1',
      title: 'Mid-Term Assessment 2',
      event_date: '2026-10-15',
      end_date: '2026-10-17',
      event_type: 'EXAM',
      description: 'Mid-term exams',
    },
    {
      id: 'cal-holiday-1',
      title: 'Vijayadashami Holiday',
      event_date: '2026-10-20',
      end_date: '2026-10-20',
      event_type: 'HOLIDAY',
    },
  ];

  const samplePosts: Post[] = [
    {
      id: 'post-1',
      host_id: 'user-arjun',
      host_name: 'Arjun Nair',
      host_role: 'STUDENT',
      title: 'Hackathon Prep Session',
      description: 'Pre-hackathon team coordination',
      category: 'STUDENT_CASUAL',
      join_mode: 'UNLOCKED',
      status: 'OPEN',
      total_slots: 5,
      filled_slots: 2,
      required_skills: ['React'],
      eligible_departments: ['ANY'],
      eligible_years: [2023],
      venue_name: 'AB1',
      start_time: '2026-10-18T14:00:00Z',
      end_time: '2026-10-18T17:00:00Z',
      od_available: false,
      created_at: '2026-10-10T00:00:00Z',
    },
    {
      id: 'post-2',
      host_id: 'user-dr-radhika',
      host_name: 'Dr. Radhika Menon',
      host_role: 'FACULTY',
      title: 'Robotics Research Lab',
      description: 'Robotics lab assistantship',
      category: 'FACULTY_RESEARCH',
      join_mode: 'LOCKED',
      status: 'OPEN',
      total_slots: 4,
      filled_slots: 2,
      required_skills: ['ROS2'],
      eligible_departments: ['ARE'],
      eligible_years: [2024],
      venue_name: 'Lab 304',
      start_time: '2026-10-19T09:00:00Z',
      end_time: '2026-10-19T12:00:00Z',
      od_available: true,
      created_at: '2026-10-10T00:00:00Z',
    },
  ];

  const sampleApplications: Application[] = [
    {
      id: 'app-priya-post-2',
      post_id: 'post-2',
      applicant_id: 'user-priya',
      applicant_name: 'Priya Sharma',
      applicant_skills: ['ROS2'],
      status: 'ACCEPTED',
      attended: false,
      created_at: '2026-10-11T00:00:00Z',
    },
  ];

  it('detects CRITICAL_EXAM clash when activity falls within university examination window', () => {
    // 2026-10-16 falls inside 2026-10-15 to 2026-10-17 exam window
    const clash = detectScheduleClash(
      '2026-10-16T10:00:00Z',
      '2026-10-16T12:00:00Z',
      sampleCalendarItems,
      samplePosts,
      sampleApplications,
      'user-priya'
    );

    expect(clash.hasClash).toBe(true);
    expect(clash.severity).toBe('CRITICAL_EXAM');
    expect(clash.conflictTitle).toBe('Mid-Term Assessment 2');
    expect(clash.conflictType).toBe('EXAM');
  });

  it('does NOT flag a clash with holidays or non-exam institutional events', () => {
    // 2026-10-20 is a holiday, not an exam
    const clash = detectScheduleClash(
      '2026-10-20T10:00:00Z',
      '2026-10-20T12:00:00Z',
      sampleCalendarItems,
      samplePosts,
      sampleApplications,
      'user-priya'
    );

    expect(clash.hasClash).toBe(false);
    expect(clash.severity).toBe('NONE');
  });

  it('detects REGISTERED_OVERLAP when student is already confirmed for an overlapping activity', () => {
    // user-priya is accepted for post-2 (2026-10-19 from 09:00 to 12:00)
    // Testing proposed time 10:30 to 13:00 on the same date (overlap: 10:30 - 12:00)
    const clash = detectScheduleClash(
      '2026-10-19T10:30:00Z',
      '2026-10-19T13:00:00Z',
      sampleCalendarItems,
      samplePosts,
      sampleApplications,
      'user-priya'
    );

    expect(clash.hasClash).toBe(true);
    expect(clash.severity).toBe('REGISTERED_OVERLAP');
    expect(clash.conflictTitle).toBe('Robotics Research Lab');
    expect(clash.conflictType).toBe('REGISTERED_ACTIVITY');
  });

  it('detects clash when the current user is HOSTING an overlapping activity', () => {
    // user-arjun hosts post-1 (2026-10-18 from 14:00 to 17:00)
    const clash = detectScheduleClash(
      '2026-10-18T15:00:00Z',
      '2026-10-18T16:00:00Z',
      sampleCalendarItems,
      samplePosts,
      sampleApplications,
      'user-arjun'
    );

    expect(clash.hasClash).toBe(true);
    expect(clash.severity).toBe('REGISTERED_OVERLAP');
    expect(clash.conflictType).toBe('HOSTED_ACTIVITY');
  });

  it('does NOT flag conflict for same-day non-overlapping times', () => {
    // user-arjun hosts post-1 on 2026-10-18 from 14:00 to 17:00
    // Proposed activity on 2026-10-18 from 09:00 to 11:00 (no overlap)
    const clash = detectScheduleClash(
      '2026-10-18T09:00:00Z',
      '2026-10-18T11:00:00Z',
      sampleCalendarItems,
      samplePosts,
      sampleApplications,
      'user-arjun'
    );

    expect(clash.hasClash).toBe(false);
    expect(clash.severity).toBe('NONE');
  });

  it('does NOT flag conflict for activities on different dates with same time of day', () => {
    // post-1 is on 2026-10-18 from 14:00 to 17:00
    // Proposed activity on 2026-10-22 from 14:00 to 17:00
    const clash = detectScheduleClash(
      '2026-10-22T14:00:00Z',
      '2026-10-22T17:00:00Z',
      sampleCalendarItems,
      samplePosts,
      sampleApplications,
      'user-arjun'
    );

    expect(clash.hasClash).toBe(false);
    expect(clash.severity).toBe('NONE');
  });

  it('ignores the current post itself when checking clash for an existing event', () => {
    const clash = detectScheduleClash(
      '2026-10-18T14:00:00Z',
      '2026-10-18T17:00:00Z',
      sampleCalendarItems,
      samplePosts,
      sampleApplications,
      'user-arjun',
      'post-1' // currentPostId
    );

    expect(clash.hasClash).toBe(false);
    expect(clash.severity).toBe('NONE');
  });

  it('handles invalid or empty date inputs safely', () => {
    const clash = detectScheduleClash(
      'invalid-date',
      'also-invalid',
      sampleCalendarItems,
      samplePosts,
      sampleApplications,
      'user-arjun'
    );

    expect(clash.hasClash).toBe(false);
    expect(clash.severity).toBe('NONE');
  });
});
