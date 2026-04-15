import { promises as fs } from "fs";
import path from "path";

export interface ContactEntry {
  name: string;
  email: string;
  clinic: string;
  topic: string;
  message: string;
  source: string;
  timestamp: string;
}

type ContactInput = Omit<ContactEntry, "timestamp">;
type ContactResult = { success: boolean; message: string };

const DATA_DIR = path.join(process.cwd(), "data");
const DATA_FILE = path.join(DATA_DIR, "contact-messages.json");
const SUPABASE_URL =
  process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const SUPABASE_CONTACT_TABLE = process.env.SUPABASE_CONTACT_TABLE;

export class ContactError extends Error {
  status: number;

  constructor(message: string, status = 500) {
    super(message);
    this.name = "ContactError";
    this.status = status;
  }
}

function hasSupabaseContactConfig() {
  return Boolean(
    SUPABASE_URL && SUPABASE_SERVICE_ROLE_KEY && SUPABASE_CONTACT_TABLE
  );
}

async function fetchSupabaseContact(pathname: string, init?: RequestInit) {
  if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !SUPABASE_CONTACT_TABLE) {
    throw new Error("Supabase contact env vars are not configured.");
  }

  return fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_CONTACT_TABLE}${pathname}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_SERVICE_ROLE_KEY,
      Authorization: `Bearer ${SUPABASE_SERVICE_ROLE_KEY}`,
      ...init?.headers,
    },
  });
}

async function readEntries(): Promise<ContactEntry[]> {
  try {
    const data = await fs.readFile(DATA_FILE, "utf-8");
    return JSON.parse(data) as ContactEntry[];
  } catch {
    return [];
  }
}

async function writeEntries(entries: ContactEntry[]): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(DATA_FILE, JSON.stringify(entries, null, 2));
}

async function addToLocalContacts(entry: ContactInput): Promise<ContactResult> {
  const entries = await readEntries();
  entries.push({
    ...entry,
    timestamp: new Date().toISOString(),
  });

  try {
    await writeEntries(entries);
  } catch {
    throw new ContactError(
      "Contact storage is not configured. Please contact the site administrator.",
      503
    );
  }

  return {
    success: true,
    message: "Thanks. We've received your message and will be in touch.",
  };
}

async function addToSupabaseContacts(
  entry: ContactInput
): Promise<ContactResult> {
  const response = await fetchSupabaseContact("", {
    method: "POST",
    headers: {
      Prefer: "return=minimal",
    },
    body: JSON.stringify([
      {
        ...entry,
        timestamp: new Date().toISOString(),
      },
    ]),
  });

  if (!response.ok) {
    throw new ContactError("Failed to save your message.");
  }

  return {
    success: true,
    message: "Thanks. We've received your message and will be in touch.",
  };
}

export async function addContactMessage(
  entry: ContactInput
): Promise<ContactResult> {
  if (hasSupabaseContactConfig()) {
    return addToSupabaseContacts(entry);
  }

  return addToLocalContacts(entry);
}
