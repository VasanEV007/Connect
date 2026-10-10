export interface ValidationError {
  field: string;
  message: string;
}

export interface PostFormInput {
  title: string;
  description: string;
  category: string;
  startDate: string;
  startTime: string;
  endDate?: string;
  endTime: string;
  totalSlots: number;
  venueName: string;
  targetRoles?: { role: string; slots: number }[];
  odHours?: number;
  odAvailable?: boolean;
}

/**
 * Validates post creation input
 */
export function validatePostForm(input: PostFormInput): Record<string, string> {
  const errors: Record<string, string> = {};

  if (!input.title || input.title.trim().length < 5) {
    errors.title = 'Title must be at least 5 characters long.';
  } else if (input.title.trim().length > 120) {
    errors.title = 'Title must be 120 characters or fewer.';
  }

  if (!input.description || input.description.trim().length < 20) {
    errors.description = 'Please provide a clear description of at least 20 characters.';
  }

  if (!input.startDate) {
    errors.startDate = 'Event date is required.';
  }

  if (!input.startTime) {
    errors.startTime = 'Start time is required.';
  }

  if (!input.endTime) {
    errors.endTime = 'End time is required.';
  }

  if (input.startDate && input.startTime && input.endTime) {
    const startIso = `${input.startDate}T${input.startTime}:00`;
    const endEventDate = input.endDate || input.startDate;
    const endIso = `${endEventDate}T${input.endTime}:00`;

    const start = new Date(startIso);
    const end = new Date(endIso);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      errors.endTime = 'Invalid date or time format.';
    } else if (end <= start) {
      errors.endTime = 'End time must be after the start time.';
    }
  }

  if (input.totalSlots === undefined || input.totalSlots === null || isNaN(input.totalSlots) || input.totalSlots <= 0) {
    errors.totalSlots = 'Participant capacity must be at least 1.';
  } else if (input.totalSlots > 500) {
    errors.totalSlots = 'Capacity cannot exceed 500 participants.';
  }

  if (input.targetRoles && input.targetRoles.length > 0) {
    const roleSlotsSum = input.targetRoles.reduce((sum, r) => sum + (Number(r.slots) || 0), 0);
    if (roleSlotsSum > input.totalSlots) {
      errors.targetRoles = `Sum of allocated role slots (${roleSlotsSum}) exceeds total capacity (${input.totalSlots}).`;
    }
  }

  if (!input.venueName || input.venueName.trim().length < 2) {
    errors.venueName = 'Please select a valid campus landmark or venue.';
  }

  if (input.odAvailable) {
    if (input.odHours === undefined || input.odHours === null || isNaN(input.odHours) || input.odHours <= 0) {
      errors.odHours = 'Sanctioned OD hours must be at least 1 hour.';
    } else if (input.odHours > 40) {
      errors.odHours = 'Sanctioned OD hours cannot exceed 40 hours.';
    }
  }

  return errors;
}

/**
 * Validates an application message
 */
export function validateApplicationMessage(note: string, isRequired: boolean = false): string | null {
  if (isRequired && (!note || note.trim().length < 10)) {
    return 'Please provide a note or portfolio link explaining your experience (min 10 characters).';
  }
  if (note && note.length > 1000) {
    return 'Application note cannot exceed 1000 characters.';
  }
  return null;
}

/**
 * Validates an email address format
 */
export function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
}
