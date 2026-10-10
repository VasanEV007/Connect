import { describe, it, expect } from 'vitest';
import { parseAmritaRollNumber, getRollSummaryLabel } from './rollNumberParser';

describe('rollNumberParser utility', () => {
  it('correctly parses standard Amrita Coimbatore B.Tech roll number', () => {
    const result = parseAmritaRollNumber('CB.EN.U4ARE24001');

    expect(result.isValid).toBe(true);
    expect(result.campusCode).toBe('CB');
    expect(result.campusName).toContain('Coimbatore');
    expect(result.schoolCode).toBe('EN');
    expect(result.schoolName).toBe('School of Engineering');
    expect(result.degreeCode).toBe('U4');
    expect(result.degreeName).toContain('B.Tech');
    expect(result.deptCode).toBe('ARE');
    expect(result.deptName).toBe('Automation and Robotics Engineering');
    expect(result.joiningYear).toBe(2024);
    expect(result.rollId).toBe('001');
  });

  it('parses CSE roll number with 2023 joining batch', () => {
    const result = parseAmritaRollNumber('CB.EN.U4CSE23042');

    expect(result.isValid).toBe(true);
    expect(result.campusCode).toBe('CB');
    expect(result.deptCode).toBe('CSE');
    expect(result.deptName).toBe('Computer Science and Engineering');
    expect(result.joiningYear).toBe(2023);
    expect(result.rollId).toBe('042');
  });

  it('handles lowercase and untrimmed roll number input', () => {
    const result = parseAmritaRollNumber('  cb.en.u4ece23091  ');

    expect(result.isValid).toBe(true);
    expect(result.campusCode).toBe('CB');
    expect(result.deptCode).toBe('ECE');
    expect(result.joiningYear).toBe(2023);
  });

  it('parses other campuses such as Amritapuri, Bengaluru, and Chennai', () => {
    const amritapuri = parseAmritaRollNumber('AM.EN.U4AIE24010');
    expect(amritapuri.isValid).toBe(true);
    expect(amritapuri.campusCode).toBe('AM');
    expect(amritapuri.campusName).toContain('Amritapuri');

    const bengaluru = parseAmritaRollNumber('BL.EN.U4ME23005');
    expect(bengaluru.isValid).toBe(true);
    expect(bengaluru.campusCode).toBe('BL');
    expect(bengaluru.campusName).toContain('Bengaluru');

    const chennai = parseAmritaRollNumber('CH.EN.U4CYS24020');
    expect(chennai.isValid).toBe(true);
    expect(chennai.campusCode).toBe('CH');
    expect(chennai.campusName).toContain('Chennai');
  });

  it('parses postgraduate degrees such as P2 (M.Tech/MCA/MBA)', () => {
    const pg = parseAmritaRollNumber('CB.EN.P2MCA24015');
    expect(pg.isValid).toBe(true);
    expect(pg.degreeCode).toBe('P2');
    expect(pg.degreeName).toContain('M.Tech / MCA');
  });

  it('safely handles invalid roll number strings', () => {
    const malformed = parseAmritaRollNumber('INVALID_ROLL_123');
    expect(malformed.isValid).toBe(false);
    expect(malformed.campusCode).toBe('');
    expect(getRollSummaryLabel(malformed)).toBe('Invalid Roll Number');

    const empty = parseAmritaRollNumber('');
    expect(empty.isValid).toBe(false);
  });

  it('formats clean summary label for valid roll number', () => {
    const result = parseAmritaRollNumber('CB.EN.U4ARE24001');
    const label = getRollSummaryLabel(result);

    expect(label).toContain('ARE');
    expect(label).toContain('2024');
    expect(label).toContain('CB');
  });
});
