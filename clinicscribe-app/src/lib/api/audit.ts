import { createClient } from '@/lib/supabase/client';

export async function createAuditLog(
  clinicId: string,
  userId: string,
  action: string,
  entityType: string,
  entityId: string,
  details: Record<string, unknown> = {}
) {
  const supabase = createClient();
  const { error } = await supabase.from('audit_logs').insert({
    clinic_id: clinicId,
    user_id: userId,
    action,
    entity_type: entityType,
    entity_id: entityId,
    details,
  });
  if (error) console.error('Audit log error:', error);
}
