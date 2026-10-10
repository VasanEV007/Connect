import { UserProfile, Post, Application, UserRole } from '../types';

/**
 * PRODUCTION ROLE-BASED ACCESS CONTROL (RBAC) FOR CONNECT
 *
 * Roles supported:
 * - STUDENT: Can browse feed, apply to opportunities, view My Activities, access scoped chat.
 *   Cannot view faculty portal, review applications, or issue OD slips.
 * - FACULTY: Can browse feed, host official workshops/research, review student applications,
 *   mark attendance, issue verified On-Duty (OD) slips, and access Faculty Portal.
 *   Cannot access student-exclusive portal routes.
 * - ADMIN: System administrator with elevated inspection and verification rights.
 */

/**
 * Normalizes user role string safely
 */
export function normalizeRole(role: string | undefined | null): UserRole {
  if (!role) return 'STUDENT';
  const upper = role.toUpperCase();
  if (upper === 'FACULTY') return 'FACULTY';
  if (upper === 'ADMIN') return 'ADMIN';
  return 'STUDENT';
}

/**
 * Verifies if user has faculty privileges (FACULTY or ADMIN)
 */
export function isFacultyUser(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  const role = normalizeRole(user.role);
  return role === 'FACULTY' || role === 'ADMIN';
}

/**
 * Checks if user is authorized to access the Faculty Portal
 */
export function canAccessFacultyPortal(user: UserProfile | null | undefined): boolean {
  if (!user) return false;
  const role = normalizeRole(user.role);
  return role === 'FACULTY' || role === 'ADMIN';
}

/**
 * Checks if user is permitted to review applications for a post (must be host)
 */
export function isPostHost(user: UserProfile | null | undefined, post: Post | null | undefined): boolean {
  return Boolean(user && post && post.host_id === user.id);
}

/**
 * Checks if user is permitted to review applications for a post
 */
export function canReviewApplication(user: UserProfile | null | undefined, post: Post | null | undefined): boolean {
  return isPostHost(user, post);
}

/**
 * Checks if user is permitted to issue official On-Duty (OD) certificates
 * Strictly requires FACULTY or ADMIN role AND being the post host.
 */
export function canIssueODSlip(user: UserProfile | null | undefined, post: Post | null | undefined): boolean {
  return isFacultyUser(user) && isPostHost(user, post);
}

/**
 * Verifies scoped group chat read/write access:
 * Allowed only for host and confirmed/accepted participants.
 */
export function canAccessScopedChat(
  user: UserProfile | null | undefined,
  post: Post | null | undefined,
  applications: Application[]
): boolean {
  if (!user || !post) return false;
  if (isPostHost(user, post)) return true;
  return applications.some(
    app => app.post_id === post.id && app.applicant_id === user.id && app.status === 'ACCEPTED'
  );
}
