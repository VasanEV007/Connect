import { describe, it, expect } from 'vitest';
import { 
  validatePostForm, 
  validateApplicationMessage, 
  validateEmail, 
  validateCollegeEmail,
  PostFormInput 
} from './validation';

describe('validation utility', () => {
  const validForm: PostFormInput = {
    title: 'Autonomous Mobile Robot ROS2 Workshop',
    description: 'Hands-on training session on kinematics, mapping, and SLAM using TurtleBot4 hardware in lab.',
    category: 'FACULTY_WORKSHOP',
    startDate: '2026-10-22',
    startTime: '09:00',
    endTime: '17:00',
    totalSlots: 25,
    venueName: 'Academic Block 1 (AB1) - Robotics Lab',
    odAvailable: true,
    odHours: 8,
  };

  it('validates a completely valid post form without errors', () => {
    const errors = validatePostForm(validForm);
    expect(Object.keys(errors).length).toBe(0);
  });

  it('flags error when title is too short or too long', () => {
    const shortTitle = validatePostForm({ ...validForm, title: 'Hi' });
    expect(shortTitle.title).toBeDefined();

    const longTitle = validatePostForm({ ...validForm, title: 'A'.repeat(150) });
    expect(longTitle.title).toBeDefined();
  });

  it('allows event description to be optional or empty without error', () => {
    const emptyDesc = validatePostForm({ ...validForm, description: '' });
    expect(emptyDesc.description).toBeUndefined();

    const omittedDesc = validatePostForm({ ...validForm, description: undefined });
    expect(omittedDesc.description).toBeUndefined();
  });

  it('flags error when end time is earlier than or equal to start time', () => {
    const invalidTime = validatePostForm({
      ...validForm,
      startTime: '16:00',
      endTime: '14:00',
    });
    expect(invalidTime.endTime).toContain('End time must be after the start time');
  });

  it('flags error when participant capacity is 0 or negative or exceeds 500', () => {
    const zeroSlots = validatePostForm({ ...validForm, totalSlots: 0 });
    expect(zeroSlots.totalSlots).toBeDefined();

    const overCapacity = validatePostForm({ ...validForm, totalSlots: 600 });
    expect(overCapacity.totalSlots).toBeDefined();
  });

  it('validates casual and sports category without requiring carpool or OD fields', () => {
    const sportsForm: PostFormInput = {
      title: 'Casual Badminton Doubles Match',
      description: 'Looking for 3 players for a friendly badminton match at the campus indoor sports complex.',
      category: 'STUDENT_CASUAL',
      startDate: '2026-10-22',
      startTime: '17:00',
      endTime: '19:00',
      totalSlots: 4,
      venueName: 'Indoor Sports Complex - Court 2',
    };
    const errors = validatePostForm(sportsForm);
    expect(Object.keys(errors).length).toBe(0);
  });

  it('validates sanctioned OD hours constraints', () => {
    const invalidOd = validatePostForm({
      ...validForm,
      odAvailable: true,
      odHours: 0,
    });
    expect(invalidOd.odHours).toBeDefined();

    const excessiveOd = validatePostForm({
      ...validForm,
      odAvailable: true,
      odHours: 50,
    });
    expect(excessiveOd.odHours).toBeDefined();
  });

  it('validates carpool category specific fields', () => {
    const carpoolForm: PostFormInput = {
      ...validForm,
      category: 'CARPOOL',
      carpoolOrigin: '',
      carpoolDestination: '',
    };
    const errors = validatePostForm(carpoolForm);
    expect(errors.carpoolOrigin).toBeDefined();
    expect(errors.carpoolDestination).toBeDefined();

    const validCarpool: PostFormInput = {
      ...validForm,
      category: 'CARPOOL',
      carpoolOrigin: 'Main Gate Gate 1',
      carpoolDestination: 'Gandhipuram Bus Stand',
    };
    const validErrors = validatePostForm(validCarpool);
    expect(validErrors.carpoolOrigin).toBeUndefined();
    expect(validErrors.carpoolDestination).toBeUndefined();
  });

  it('validates application messages correctly', () => {
    expect(validateApplicationMessage('', true)).toBeDefined(); // required
    expect(validateApplicationMessage('Short', true)).toBeDefined(); // <10 chars
    expect(validateApplicationMessage('This is a solid note explaining my robotics background and GitHub links.', true)).toBeNull();
  });

  it('validates general email addresses accurately', () => {
    expect(validateEmail('student@cb.students.amrita.edu')).toBe(true);
    expect(validateEmail('faculty@cb.amrita.edu')).toBe(true);
    expect(validateEmail('not-an-email')).toBe(false);
    expect(validateEmail('')).toBe(false);
  });

  it('validates college email domains with configurable domain policy', () => {
    const amritaAllowed = ['cb.amrita.edu', 'amrita.edu', 'cb.students.amrita.edu'];

    // Valid university emails
    const res1 = validateCollegeEmail('student@cb.students.amrita.edu', amritaAllowed);
    expect(res1.isValid).toBe(true);
    expect(res1.normalizedEmail).toBe('student@cb.students.amrita.edu');

    const res2 = validateCollegeEmail('faculty@cb.amrita.edu', amritaAllowed);
    expect(res2.isValid).toBe(true);

    const res3 = validateCollegeEmail('CAPS.USER@AMRITA.EDU', amritaAllowed);
    expect(res3.isValid).toBe(true);
    expect(res3.normalizedEmail).toBe('caps.user@amrita.edu');

    // Invalid non-university emails
    const res4 = validateCollegeEmail('random@gmail.com', amritaAllowed);
    expect(res4.isValid).toBe(false);
    expect(res4.message).toContain('Only official college email addresses are permitted');

    const res5 = validateCollegeEmail('spammer@yahoo.com', amritaAllowed);
    expect(res5.isValid).toBe(false);

    // Empty or invalid syntax
    const res6 = validateCollegeEmail('', amritaAllowed);
    expect(res6.isValid).toBe(false);
  });
});
