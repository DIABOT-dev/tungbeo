import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { makeRouteClient } from '@/lib/supabase-server';

export async function GET() {
  const supabase = makeRouteClient(cookies);
  const { data: { user }, error } = await supabase.auth.getUser();
  return NextResponse.json({ user, error });
}