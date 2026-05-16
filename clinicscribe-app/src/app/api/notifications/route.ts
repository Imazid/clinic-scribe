import { NextResponse } from 'next/server';
import {
  checkOrigin,
  forbidden,
  logError,
  rateLimit,
  requireUser,
  tooMany,
} from '@/lib/apiSecurity';

/**
 * Lists the caller's recent notifications. We cap at 50 because the panel
 * is a slide-out, not a paginated inbox — if a clinician has >50 unread
 * something else is wrong.
 */
export async function GET() {
  const { user, supabase, response } = await requireUser();
  if (response) return response;

  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('id, kind, title, body, link, cta_label, is_read, created_at, read_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      // Schema missing → return an empty inbox so the UI doesn't error out.
      // PGRST205 = relation does not exist (PostgREST). PGRST204 = column.
      const code = (error as { code?: string }).code;
      if (code === 'PGRST205' || code === 'PGRST204' || code === '42P01') {
        return NextResponse.json({ notifications: [], unread: 0 });
      }
      logError('notifications-list', error);
      return NextResponse.json({ error: 'Failed to load notifications' }, { status: 500 });
    }

    const unread = (data ?? []).filter((n) => !n.is_read).length;
    return NextResponse.json({ notifications: data ?? [], unread });
  } catch (error) {
    logError('notifications-list', error);
    return NextResponse.json({ error: 'Failed to load notifications' }, { status: 500 });
  }
}

/**
 * Marks notifications read. Body: { id?: string }
 *   - With `id` → marks that single notification
 *   - Without  → marks all unread for the caller
 *
 * Returns 200 unconditionally so the UI can update optimistically.
 */
export async function POST(request: Request) {
  if (!checkOrigin(request)) return forbidden('Invalid origin');

  const { user, supabase, response } = await requireUser();
  if (response) return response;
  if (!(await rateLimit(`notifications-mark:${user.id}`, 60, 60_000))) return tooMany();

  let body: { id?: string };
  try {
    body = (await request.json().catch(() => ({}))) as { id?: string };
  } catch {
    body = {};
  }

  try {
    const update = supabase
      .from('notifications')
      .update({ is_read: true, read_at: new Date().toISOString() })
      .eq('user_id', user.id)
      .eq('is_read', false);

    const { error } = body.id ? await update.eq('id', body.id) : await update;

    if (error) {
      const code = (error as { code?: string }).code;
      if (code === 'PGRST205' || code === 'PGRST204' || code === '42P01') {
        return NextResponse.json({ ok: true });
      }
      logError('notifications-mark', error);
      return NextResponse.json({ error: 'Failed to update' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    logError('notifications-mark', error);
    return NextResponse.json({ ok: true });
  }
}
