import { describe, it, expect } from 'vitest';
import { validatePostForm, validateApplicationMessage, validateEmail, PostFormInput } from './validation';

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

  it('flags error when description is insufficient (<20 chars)', () => {
    const shortDesc = validatePostForm({ ...validForm, description: 'Short desc' });
    expect(shortDesc.description).toBeDefined();
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

  it('flags error when sum of target role slots exceeds total slots', () => {
    const invalidRoles = validatePostForm({
      ...validForm,
      totalSlots: 5,
      targetRoles: [
        { role: 'Lead', slots: 4 },
        { role: 'Contributor', slots: 3 }, // Sum = 7 > 5
      ],
    });
    expect(invalidRoles.targetRoles).toContain('exceeds total capacity');
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

  it('validates application messages correctly', () => {
    expect(validateApplicationMessage('', true)).toBeDefined(); // required
    expect(validateApplicationMessage('Short', true)).toBeDefined(); // <10 chars
    expect(validateApplicationMessage('This is a solid note explaining my robotics background and GitHub links.', true)).toBeNull();
  });

  it('validates email addresses accurately', () => {
    expect(validateEmail('arjun.nair@cb.students.amrita.edu')).toBe(true);
    expect(validateEmail('radhika.menon@cb.amrita.edu')).toBe(true);
    expect(validateEmail('not-an-email')).toBe(false);
    expect(validateEmail('')).toBe(false);
  });
});
