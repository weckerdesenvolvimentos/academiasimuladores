import { createServerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { prisma } from './prisma';

export type UserRole = 'VIEWER' | 'EDITOR' | 'ADMIN';

export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
}

export async function createServerSupabaseClient() {
  const cookieStore = cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value;
        },
      },
    }
  );
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const supabase = await createServerSupabaseClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) return null;

    const dbUser = await prisma.user.findUnique({
      where: { email: user.email! },
    });

    if (!dbUser) return null;

    return {
      id: dbUser.id,
      email: dbUser.email,
      name: dbUser.name || undefined,
      role: dbUser.role as UserRole,
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}

export async function requireRole(requiredRole: UserRole): Promise<AuthUser> {
  const user = await requireAuth();
  
  const roleHierarchy: Record<UserRole, number> = {
    VIEWER: 1,
    EDITOR: 2,
    ADMIN: 3,
  };

  if (roleHierarchy[user.role] < roleHierarchy[requiredRole]) {
    throw new Error('Insufficient permissions');
  }

  return user;
}

export function canView(user: AuthUser | null): boolean {
  return !!user;
}

export function canEdit(user: AuthUser | null): boolean {
  return user?.role === 'EDITOR' || user?.role === 'ADMIN';
}

export function canAdmin(user: AuthUser | null): boolean {
  return user?.role === 'ADMIN';
}

export async function createUserFromSupabase(supabaseUser: any) {
  const existingUser = await prisma.user.findUnique({
    where: { email: supabaseUser.email },
  });

  if (existingUser) {
    return existingUser;
  }

  return prisma.user.create({
    data: {
      email: supabaseUser.email,
      name: supabaseUser.user_metadata?.full_name || supabaseUser.email,
      role: 'VIEWER',
    },
  });
}

export async function updateUserRole(userId: string, role: UserRole) {
  return prisma.user.update({
    where: { id: userId },
    data: { role },
  });
}

export function getRolePermissions(role: UserRole) {
  const permissions = {
    VIEWER: {
      canView: true,
      canEdit: false,
      canDelete: false,
      canAdmin: false,
      canImport: false,
      canExport: true,
    },
    EDITOR: {
      canView: true,
      canEdit: true,
      canDelete: true,
      canAdmin: false,
      canImport: true,
      canExport: true,
    },
    ADMIN: {
      canView: true,
      canEdit: true,
      canDelete: true,
      canAdmin: true,
      canImport: true,
      canExport: true,
    },
  };

  return permissions[role];
}
