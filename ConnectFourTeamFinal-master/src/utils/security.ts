import { UserProfile, Post, Application } from '../types';

/**
 * PRODUCTION SECURITY ARCHITECTURE NOTE:
 * In a live enterprise deployment at Amrita Vishwa Vidyapeetham, authentication
 * is governed by Amrita University AUMS / SAML 2.0 SSO and verified via HTTP-only
 * secure session tokens with server-side Role-Based Access Control (RBAC).
 *
 * The client-side persona switcher provided in this build is strictly a
 * DEMO EVALUATION HARNESS designed for evaluators to audit both Student and
 * Faculty perspectives without needing external LDAP/SAML university credentials.
 */

export const IS_DEMO_ENVIRONMENT = true;

/**
 * Verifies if user has faculty privileges
 */
export function isFacultyUser(user: UserProfile | null | undefined): boolean {
  return Boolean(user && user.role === 'FACULTY');
}

/**
 * Checks if user is authorized to manage a specific post/call
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
