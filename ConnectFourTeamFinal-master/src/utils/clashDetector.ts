import { AcademicCalendarItem, Post, Application } from '../types';

export interface ClashDetail {
  hasClash: boolean;
  severity: 'CRITICAL_EXAM' | 'REGISTERED_OVERLAP' | 'NONE';
  conflictTitle?: string;
  conflictType?: 'EXAM' | 'REGISTERED_ACTIVITY' | 'HOSTED_ACTIVITY';
  conflictTimeDescription?: string;
  explanation?: string;
}

/**
 * Normalizes any ISO string or YYYY-MM-DD string into a safe timestamp in ms.
 * If dateOnly is true, converts to local start-of-day or end-of-day.
 */
function parseSafeDate(dateStr: string, isEndOfDay: boolean = false): number | null {
  if (!dateStr || typeof dateStr !== 'string') return null;

  // If format is YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr.trim())) {
    const timeSuffix = isEndOfDay ? 'T23:59:59.999' : 'T00:00:00.000';
    const parsed = new Date(`${dateStr.trim()}${timeSuffix}`).getTime();
    return isNaN(parsed) ? null : parsed;
  }

  const parsed = new Date(dateStr).getTime();
  return isNaN(parsed) ? null : parsed;
}

/**
 * Checks whether a proposed start/end time window conflicts with:
 * 1. Institutional exams on the academic calendar (Critical)
 * 2. Activities the current user is already registered for (Overlap)
 * 3. Activities hosted by the current user
 *
 * Rules:
 * - Two activities on different dates must NEVER be flagged as conflicting.
 * - Missing start/end times and date-only records are handled safely.
 * - Overlaps require targetStart < existingEnd AND targetEnd > existingStart.
 */
export function detectScheduleClash(
  startTimeIso: string,
  endTimeIso: string,
  calendarItems: AcademicCalendarItem[],
  posts: Post[],
  applications: Application[],
  currentUserId: string,
  currentPostId?: string
): ClashDetail {
  const targetStart = parseSafeDate(startTimeIso);
  let targetEnd = parseSafeDate(endTimeIso);

  if (targetStart === null) {
    return { hasClash: false, severity: 'NONE' };
  }

  // If end time is missing or before start time, default to 1 hour after start
  if (targetEnd === null || targetEnd <= targetStart) {
    targetEnd = targetStart + 3600000; // 1 hour
  }

  // 1. Check Institutional Exam Periods
  for (const item of calendarItems) {
    if (item.event_type === 'EXAM') {
      const examStart = parseSafeDate(item.event_date, false);
      const examEnd = parseSafeDate(item.end_date || item.event_date, true);

      if (examStart !== null && examEnd !== null) {
        // True interval overlap: targetStart <= examEnd && targetEnd >= examStart
        if (targetStart <= examEnd && targetEnd >= examStart) {
          const dateDesc = item.end_date && item.end_date !== item.event_date
            ? `${item.event_date} to ${item.end_date}`
            : item.event_date;

          return {
            hasClash: true,
            severity: 'CRITICAL_EXAM',
            conflictTitle: item.title,
            conflictType: 'EXAM',
            conflictTimeDescription: dateDesc,
            explanation: `Collides with official university exam period "${item.title}" (${dateDesc}). Continuous assessment attendance is mandatory.`,
          };
        }
      }
    }
  }

  // 2. Check Accepted Registered Activities and Hosted Activities for the current user
  if (!currentUserId) {
    return { hasClash: false, severity: 'NONE' };
  }

  const acceptedPostIds = new Set(
    applications
      .filter(app => app.applicant_id === currentUserId && app.status === 'ACCEPTED')
      .map(app => app.post_id)
  );

  const committedPosts = posts.filter(p => {
    if (currentPostId && p.id === currentPostId) return false;
    return acceptedPostIds.has(p.id) || p.host_id === currentUserId;
  });

  for (const p of committedPosts) {
    const pStart = parseSafeDate(p.start_time);
    let pEnd = parseSafeDate(p.end_time);

    if (pStart === null) continue;
    if (pEnd === null || pEnd <= pStart) {
      pEnd = pStart + 3600000;
    }

    // Strict open interval overlap: targetStart < pEnd && targetEnd > pStart
    if (targetStart < pEnd && targetEnd > pStart) {
      const isHost = p.host_id === currentUserId;
      const type = isHost ? 'HOSTED_ACTIVITY' : 'REGISTERED_ACTIVITY';
      
      const pStartDate = new Date(pStart);
      const pEndDate = new Date(pEnd);
      const timeStr = `${pStartDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })} (${pStartDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${pEndDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })})`;

      return {
        hasClash: true,
        severity: 'REGISTERED_OVERLAP',
        conflictTitle: p.title,
        conflictType: type,
        conflictTimeDescription: timeStr,
        explanation: `Overlaps with ${isHost ? 'an event hosted by you' : 'an activity you are confirmed for'}: "${p.title}" on ${timeStr}.`,
      };
    }
  }

  return { hasClash: false, severity: 'NONE' };
}
