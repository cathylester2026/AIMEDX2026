// Thin Supabase layer. Every call returns { data, error } where error is a readable string,
// so the app can show the real reason instead of a vague "session not found".
import { createClient } from '@supabase/supabase-js';

const ENV = (typeof import.meta !== 'undefined' && import.meta.env) || {};
const URL = ENV.VITE_SUPABASE_URL || '';
const KEY = ENV.VITE_SUPABASE_ANON_KEY || '';

export const configured = Boolean(URL && KEY);
export const sb = configured ? createClient(URL, KEY, { realtime: { params: { eventsPerSecond: 5 } } }) : null;
export const projectHost = URL ? URL.replace(/^https?:\/\//, '').split('.')[0] : '';

const NOT_CONFIGURED = 'This build has no Supabase keys. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY as repository secrets and redeploy.';

const nice = (e) => {
  if (!e) return null;
  const m = e.message || String(e);
  if (/relation .* does not exist|schema cache|Could not find the table/i.test(m)) return `The tables are missing in this Supabase project. Run sql/supabase_schema.sql. (${m})`;
  if (/row-level security|violates row-level|permission denied/i.test(m)) return `Row-level security is blocking this. Re-run sql/supabase_schema.sql so the anon policies exist. (${m})`;
  if (/Invalid API key|JWT|apikey/i.test(m)) return `The anon key is not accepted. Check VITE_SUPABASE_ANON_KEY belongs to the same project as the URL. (${m})`;
  if (/Failed to fetch|NetworkError|fetch failed/i.test(m)) return `Cannot reach Supabase. Check VITE_SUPABASE_URL and the network. (${m})`;
  return m;
};

const CODE_CHARS = 'ABCDEFGHJKMNPQRSTUVWXYZ'; // no I, L or O
export const makeCode = () => Array.from({ length: 4 }, () => CODE_CHARS[Math.floor(Math.random() * CODE_CHARS.length)]).join('');
export const cleanCode = (c) => (c || '').toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 8);

export async function createSession() {
  if (!sb) return { data: null, error: NOT_CONFIGURED };
  for (let i = 0; i < 6; i++) {
    const code = makeCode();
    const { data, error } = await sb.from('bd_sessions').insert({ code, phase: 'lobby' }).select().maybeSingle();
    if (!error) return { data, error: null };
    if (!/duplicate|unique/i.test(error.message || '')) return { data: null, error: nice(error) };
  }
  return { data: null, error: 'Could not find a free session code. Try again.' };
}

export async function getSession(code) {
  if (!sb) return { data: null, error: NOT_CONFIGURED };
  const { data, error } = await sb.from('bd_sessions').select('*').eq('code', cleanCode(code)).maybeSingle();
  return { data, error: nice(error) };
}

export async function setPhase(code, phase) {
  if (!sb) return { data: null, error: NOT_CONFIGURED };
  const { data, error } = await sb.from('bd_sessions').update({ phase }).eq('code', code).select().maybeSingle();
  return { data, error: nice(error) };
}

export async function listTables(code) {
  if (!sb) return { data: [], error: NOT_CONFIGURED };
  const { data, error } = await sb.from('bd_tables').select('*').eq('session_code', code).order('table_no');
  return { data: data || [], error: nice(error) };
}

export async function joinTable(code, tableNo) {
  if (!sb) return { data: null, error: NOT_CONFIGURED };
  const c = cleanCode(code);
  const up = await sb.from('bd_tables').upsert({ session_code: c, table_no: tableNo }, { onConflict: 'session_code,table_no', ignoreDuplicates: true });
  if (up.error) return { data: null, error: nice(up.error) };
  const { data, error } = await sb.from('bd_tables').select('*').eq('session_code', c).eq('table_no', tableNo).maybeSingle();
  if (!error && !data) return { data: null, error: 'The table row was not created or cannot be read. Re-run sql/supabase_schema.sql (select policy).' };
  return { data, error: nice(error) };
}

export async function patchTable(code, tableNo, patch) {
  if (!sb) return { data: null, error: NOT_CONFIGURED };
  const { data, error } = await sb.from('bd_tables').update(patch).eq('session_code', code).eq('table_no', tableNo).select().maybeSingle();
  return { data, error: nice(error) };
}

// Poll as the safety net, realtime as the fast path.
export function watch(code, onChange, ms = 2500) {
  if (!sb) return () => {};
  const timer = setInterval(onChange, ms);
  let channel = null;
  try {
    channel = sb.channel(`bd-${code}-${Math.random().toString(36).slice(2, 7)}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bd_tables', filter: `session_code=eq.${code}` }, onChange)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bd_sessions', filter: `code=eq.${code}` }, onChange)
      .subscribe();
  } catch (e) { /* polling continues */ }
  return () => {
    clearInterval(timer);
    if (channel) sb.removeChannel(channel);
  };
}

// Used by the #/check page: tells you exactly which step breaks.
export async function diagnose() {
  const steps = [];
  const add = (name, ok, detail = '') => steps.push({ name, ok, detail });
  add('Keys present in this build', configured, configured ? `Project ${projectHost}` : NOT_CONFIGURED);
  if (!configured) return steps;

  const r1 = await sb.from('bd_sessions').select('code').limit(1);
  add('Read bd_sessions', !r1.error, r1.error ? nice(r1.error) : 'OK');
  const r2 = await sb.from('bd_tables').select('id').limit(1);
  add('Read bd_tables', !r2.error, r2.error ? nice(r2.error) : 'OK');

  const code = `T${Math.floor(Math.random() * 900 + 100)}`;
  const w1 = await sb.from('bd_sessions').insert({ code, phase: 'lobby' }).select().maybeSingle();
  add('Create a test session', !w1.error && !!w1.data, w1.error ? nice(w1.error) : 'OK');
  if (!w1.error) {
    const w2 = await sb.from('bd_tables').upsert({ session_code: code, table_no: 1 }, { onConflict: 'session_code,table_no', ignoreDuplicates: true });
    add('Create a test table', !w2.error, w2.error ? nice(w2.error) : 'OK');
    const w3 = await sb.from('bd_tables').select('*').eq('session_code', code).eq('table_no', 1).maybeSingle();
    add('Read the table back (this is the “session not found” check)', !w3.error && !!w3.data, w3.error ? nice(w3.error) : w3.data ? 'OK' : 'Row not visible: re-run the SQL script');
    const w4 = await sb.from('bd_tables').update({ path: 'confidence' }).eq('session_code', code).eq('table_no', 1).select().maybeSingle();
    add('Update a table', !w4.error && !!w4.data, w4.error ? nice(w4.error) : w4.data ? 'OK' : 'Update returned no row');
    await sb.from('bd_sessions').delete().eq('code', code);
  }
  const rt = await new Promise((resolve) => {
    let done = false;
    const ch = sb.channel(`diag-${Math.random().toString(36).slice(2, 6)}`).subscribe((status) => {
      if (done) return;
      if (status === 'SUBSCRIBED') { done = true; sb.removeChannel(ch); resolve({ ok: true, detail: 'Realtime connected' }); }
      if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') { done = true; sb.removeChannel(ch); resolve({ ok: false, detail: `Realtime: ${status}. The app still works by polling every 2.5 seconds.` }); }
    });
    setTimeout(() => { if (!done) { done = true; sb.removeChannel(ch); resolve({ ok: false, detail: 'Realtime did not connect in 6 seconds. The app still works by polling.' }); } }, 6000);
  });
  add('Realtime', rt.ok, rt.detail);
  return steps;
}
