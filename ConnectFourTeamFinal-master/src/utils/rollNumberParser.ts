import { ParsedRollNumber } from '../types';

const CAMPUS_MAP: Record<string, string> = {
  CB: 'Coimbatore (Ettimadai)',
  AM: 'Amritapuri (Kollam)',
  BL: 'Bengaluru (Kasavanahalli)',
  CH: 'Chennai (Vengal)',
  KO: 'Kochi (Edappally)',
  MY: 'Mysuru',
  AR: 'Amaravati',
  NC: 'Nagercoil',
};

const SCHOOL_MAP: Record<string, string> = {
  EN: 'School of Engineering',
  SC: 'School of Computing',
  AS: 'School of Arts and Sciences',
  BT: 'School of Biotechnology',
  AG: 'School of Agricultural Sciences',
  PH: 'School of Pharmacy',
  BU: 'School of Business',
};

const DEGREE_MAP: Record<string, string> = {
  U4: 'B.Tech (Undergraduate 4-Year)',
  U3: 'B.Sc / BCA / BBA (Undergraduate 3-Year)',
  U5: 'Integrated M.Sc (5-Year)',
  P2: 'M.Tech / MCA / MBA / M.Sc (Postgraduate 2-Year)',
  P3: 'Integrated MS / M.Phil (3-Year)',
  D1: 'Ph.D Doctoral Program',
};

const DEPT_MAP: Record<string, string> = {
  ARE: 'Automation and Robotics Engineering',
  CSE: 'Computer Science and Engineering',
  AIE: 'Artificial Intelligence & Data Science',
  AI: 'Artificial Intelligence',
  ECE: 'Electronics and Communication Engineering',
  EEE: 'Electrical and Electronics Engineering',
  ME: 'Mechanical Engineering',
  MEC: 'Mechanical Engineering',
  CYS: 'Cyber Security Engineering',
  CHE: 'Chemical Engineering',
  AER: 'Aerospace Engineering',
  CIV: 'Civil Engineering',
  CCE: 'Computer & Communication Engineering',
  EAC: 'Electronics & Computer Engineering',
  MCA: 'Master of Computer Applications',
  DSA: 'Data Science & Analytics',
  ROB: 'Robotics & Automation',
};

/**
 * Parses Amrita Vishwa Vidyapeetham roll numbers (e.g., CB.EN.U4ARE24001, CB.EN.U4CSE23042)
 */
export function parseAmritaRollNumber(raw: string): ParsedRollNumber {
  if (!raw || typeof raw !== 'string') {
    return createEmptyParsedRoll(raw || '');
  }

  const clean = raw.trim().toUpperCase();

  // Pattern: [2 letters].[2 letters].[degree 2 chars][dept 2-4 chars][year 2 digits][roll 3-4 digits]
  // Example: CB.EN.U4ARE24001 -> campus=CB, school=EN, degree=U4, dept=ARE, year=24, rollId=001
  const regex = /^([A-Z]{2})\.([A-Z]{2})\.([A-Z0-9]{2})([A-Z]{2,4})(\d{2})(\d{3,4})$/;
  const match = clean.match(regex);

  if (!match) {
    return createEmptyParsedRoll(raw);
  }

  const [, campusCode, schoolCode, degreeCode, deptCode, yearStr, rollId] = match;
  const joiningYear = 2000 + parseInt(yearStr, 10);
  
  // Calculate current year of study based on current date (academic year begins July/August)
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth(); // 0-indexed (July is 6)
  let diffYears = currentYear - joiningYear;
  if (currentMonth >= 6) {
    diffYears += 1;
  }
  const currentYearStudy = Math.min(Math.max(diffYears, 1), 5);

  return {
    campusCode,
    campusName: CAMPUS_MAP[campusCode] || `Amrita ${campusCode} Campus`,
    schoolCode,
    schoolName: SCHOOL_MAP[schoolCode] || `School of ${schoolCode}`,
    degreeCode,
    degreeName: DEGREE_MAP[degreeCode] || `Degree (${degreeCode})`,
    deptCode,
    deptName: DEPT_MAP[deptCode] || deptCode,
    joiningYear,
    currentYearStudy,
    rollId,
    isValid: true,
    rawInput: clean,
  };
}

function createEmptyParsedRoll(raw: string): ParsedRollNumber {
  return {
    campusCode: '',
    campusName: 'Unknown Campus',
    schoolCode: '',
    schoolName: 'Unknown School',
    degreeCode: '',
    degreeName: 'Unknown Degree',
    deptCode: '',
    deptName: 'Unknown Department',
    joiningYear: new Date().getFullYear(),
    currentYearStudy: 1,
    rollId: '',
    isValid: false,
    rawInput: raw,
  };
}

/**
 * Formats parsed roll info into a clean label
 */
export function getRollSummaryLabel(parsed: ParsedRollNumber): string {
  if (!parsed.isValid) return 'Invalid Roll Number';
  return `${parsed.deptCode} • ${parsed.currentYearStudy}${getOrdinalSuffix(parsed.currentYearStudy)} Year (${parsed.joiningYear}) • ${parsed.campusCode}`;
}

export function getOrdinalSuffix(n: number): string {
  if (n === 1) return 'st';
  if (n === 2) return 'nd';
  if (n === 3) return 'rd';
  return 'th';
}

export interface ParsedAmritaEmail {
  email: string;
  isAmrita: boolean;
  role: 'STUDENT' | 'FACULTY';
  isVerified: boolean;
  rollNumber?: string;
  campusCode?: string;
  campusName?: string;
  schoolCode?: string;
  schoolName?: string;
  degreeCode?: string;
  degreeName?: string;
  deptCode?: string;
  department?: string;
  joiningYear?: number;
  currentYearStudy?: number;
  rollId?: string;
  designation?: string;
  suggestedName?: string;
}

/**
 * Parses official Amrita university email addresses.
 * - Students: CB.EN.U4ARE24044@cb.students.amrita.edu
 * - Faculty: name@cb.amrita.edu / name@amrita.edu
 */
export function parseAmritaEmail(rawEmail: string): ParsedAmritaEmail {
  if (!rawEmail || typeof rawEmail !== 'string') {
    return {
      email: '',
      isAmrita: false,
      role: 'STUDENT',
      isVerified: false,
    };
  }

  const email = rawEmail.trim().toLowerCase();
  const atIndex = email.indexOf('@');
  if (atIndex === -1) {
    return {
      email,
      isAmrita: false,
      role: 'STUDENT',
      isVerified: false,
    };
  }

  const prefix = email.slice(0, atIndex).trim().toUpperCase();
  const domain = email.slice(atIndex + 1).trim().toLowerCase();

  const isAmritaDomain = 
    domain.endsWith('amrita.edu') || 
    domain.endsWith('cb.amrita.edu') || 
    domain.endsWith('students.amrita.edu');

  // Check if prefix contains or matches an Amrita roll number (e.g. CB.EN.U4ARE24044)
  const parsedRoll = parseAmritaRollNumber(prefix);

  if (parsedRoll.isValid) {
    return {
      email,
      isAmrita: isAmritaDomain,
      role: 'STUDENT',
      isVerified: true,
      rollNumber: parsedRoll.rawInput,
      campusCode: parsedRoll.campusCode,
      campusName: parsedRoll.campusName,
      schoolCode: parsedRoll.schoolCode,
      schoolName: parsedRoll.schoolName,
      degreeCode: parsedRoll.degreeCode,
      degreeName: parsedRoll.degreeName,
      deptCode: parsedRoll.deptCode,
      department: parsedRoll.deptName,
      joiningYear: parsedRoll.joiningYear,
      currentYearStudy: parsedRoll.currentYearStudy,
      rollId: parsedRoll.rollId,
    };
  }

  // Check if faculty domain (e.g., name@cb.amrita.edu or name@amrita.edu without 'students')
  const isStudentDomain = domain.includes('students');

  if (!isStudentDomain && isAmritaDomain) {
    const campusCode = domain.startsWith('cb.') ? 'CB' : 'CB';
    const cleanName = prefix
      .replace(/[._-]/g, ' ')
      .toLowerCase()
      .split(' ')
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');

    return {
      email,
      isAmrita: true,
      role: 'FACULTY',
      isVerified: true,
      campusCode,
      campusName: CAMPUS_MAP[campusCode] || 'Coimbatore (Ettimadai)',
      department: 'Engineering',
      designation: 'Assistant Professor',
      suggestedName: cleanName || 'Faculty Member',
    };
  }

  return {
    email,
    isAmrita: isAmritaDomain,
    role: 'STUDENT',
    isVerified: false,
  };
}
