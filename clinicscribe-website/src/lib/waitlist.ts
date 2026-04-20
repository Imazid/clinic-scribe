import { promises as fs } from "fs";
import path from "path";

export interface WaitlistEntry {
  name: string;
  email: string;
  role: string;
  timestamp: string;
  source: string;
}

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "waitlist.json");
const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_WAITLIST_TABLE =
  process.env.SUPABASE_WAITLIST_TABLE || "waitlist_signups";

type WaitlistInput = Omit<WaitlistEntry, "timestamp">;
type WaitlistResult = { success: boolean; message: string };

export class WaitlistError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "WaitlistError";
    this.status = status;
  }
}

function hasSupabaseWaitlistConfig() {
  return Boolean(SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY);
}

async function fetchSupabaseWaitlist(pathname: string, init?: RequestInit) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
    throw new Error("Supabase waitlist env vars are not configured.");
  }

  return fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_WAITLIST_TABLE}${pathname}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      ...init?.headers,
    },
  });
}

async function readEntries(): Promise<WaitlistEntry[]> {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function writeEntries(entries: WaitlistEntry[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(entries, null, 2));
}

export async function isEmailRegistered(email: string): Promise<boolean> {
  if (hasSupabaseWaitlistConfig()) {
    const query = `?select=email&email=eq.${encodeURIComponent(email.toLowerCase())}&limit=1`;
    const response = await fetchSupabaseWaitlist(query, { method: "GET" });

    if (!response.ok) {
      throw new WaitlistError("Failed to check waitlist in Supabase.");
    }

    const entries = (await response.json()) as Array<{ email: string }>;
    return entries.length > 0;
  }

  const entries = await readEntries();
  return entries.some((e) => e.email.toLowerCase() === email.toLowerCase());
}

async function addToLocalWaitlist(entry: WaitlistInput): Promise<WaitlistResult> {
  const entries = await readEntries();
  const normalized = entry.email.toLowerCase();

  if (entries.some((e) => e.email.toLowerCase() === normalized)) {
    return { success: true, message: "You're on the list!" };
  }

  entries.push({
    ...entry,
    timestamp: new Date().toISOString(),
  });

  try {
    await writeEntries(entries);
  } catch {
    throw new WaitlistError(
      "Waitlist storage is not configured. Please contact the site administrator.",
      503
    );
  }

  return { success: true, message: "You're on the list!" };
}

async function addToSupabaseWaitlist(entry: WaitlistInput): Promise<WaitlistResult> {
  const response = await fetchSupabaseWaitlist("", {
    method: "POST",
    headers: {
      Prefer: "return=minimal,resolution=ignore-duplicates",
    },
    body: JSON.stringify([
      {
        name: entry.name,
        email: entry.email.toLowerCase(),
        role: entry.role,
        source: entry.source,
        timestamp: new Date().toISOString(),
      },
    ]),
  });

  if (!response.ok && response.status !== 409) {
    throw new WaitlistError("Failed to save waitlist entry to Supabase.");
  }

  return { success: true, message: "You're on the list!" };
}

export async function addToWaitlist(entry: WaitlistInput): Promise<WaitlistResult> {
  if (hasSupabaseWaitlistConfig()) {
    return addToSupabaseWaitlist(entry);
  }

  return addToLocalWaitlist(entry);
}

export async function getWaitlistCount(): Promise<number> {
  if (hasSupabaseWaitlistConfig()) {
    const response = await fetchSupabaseWaitlist("?select=id", {
      method: "HEAD",
      headers: {
        Prefer: "count=exact",
      },
    });

    if (!response.ok) {
      throw new WaitlistError("Failed to fetch waitlist count from Supabase.");
    }

    return Number(response.headers.get("content-range")?.split("/")[1] || 0);
  }

  const entries = await readEntries();
  return entries.length;
}
