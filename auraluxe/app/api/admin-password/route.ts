import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 8 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

export async function GET() {
  try {
    const { data: current } = await supabase
      .from('admin_password')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    const now = new Date();
    const needsRotation = !current || new Date(current.expires_at) < now;

    if (needsRotation) {
      const newPassword = generatePassword();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000);

      await supabase.from('admin_password').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      
      const { data: newEntry } = await supabase
        .from('admin_password')
        .insert({
          password: newPassword,
          expires_at: expiresAt.toISOString(),
        })
        .select()
        .single();

      return NextResponse.json({ 
        password: newPassword, 
        expiresAt: expiresAt.toISOString(),
        rotated: true 
      });
    }

    return NextResponse.json({ 
      password: current.password, 
      expiresAt: current.expires_at,
      rotated: false 
    });
  } catch (error) {
    console.error('Admin password error:', error);
    return NextResponse.json({ error: 'Failed to get password' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();

    const { data: current } = await supabase
      .from('admin_password')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!current) {
      return NextResponse.json({ valid: false });
    }

    const now = new Date();
    const isExpired = new Date(current.expires_at) < now;
    const isValid = current.password === password && !isExpired;

    return NextResponse.json({ valid: isValid });
  } catch (error) {
    console.error('Password validation error:', error);
    return NextResponse.json({ valid: false });
  }
}
