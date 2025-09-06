import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/auth';

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (session) {
    redirect('/dashboard');
  } else {
    redirect('/auth/login');
  }
}
