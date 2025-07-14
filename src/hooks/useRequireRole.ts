import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

/**
 * Hook that redirects users who don't have the required role
 * Can be used as an HOC to protect role-specific pages
 * 
 * @param requiredRole - The role required to access the page
 * @param redirectTo - Where to redirect if user doesn't have the role (defaults to /dashboard)
 * 
 * @example
 * // Basic usage in a coach-only component:
 * const MyCoachComponent = () => {
 *   const hasAccess = useRequireRole('coach');
 *   
 *   if (!hasAccess) return null; // Will redirect automatically
 *   
 *   return <div>Coach-only content</div>;
 * };
 * 
 * @example 
 * // With custom redirect path:
 * const hasAccess = useRequireRole('coach', '/unauthorized');
 */
export const useRequireRole = (
  requiredRole: 'coach' | 'athlete' | 'solo',
  redirectTo: string = '/dashboard'
) => {
  const { profile, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && profile) {
      if (profile.role !== requiredRole) {
        console.log(`User role '${profile.role}' does not match required role '${requiredRole}', redirecting to ${redirectTo}`);
        navigate(redirectTo, { replace: true });
      }
    }
  }, [profile, loading, requiredRole, redirectTo, navigate]);

  // Return whether the user has the required role
  return !loading && profile?.role === requiredRole;
};