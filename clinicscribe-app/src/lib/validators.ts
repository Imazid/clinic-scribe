import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

// 12-char minimum aligns with RACGP / ACSC guidance for healthcare access.
// The signup form copy already says "At least 12 characters" — schema and
// UI now match.
const strongPassword = z
  .string()
  .min(12, 'Must be at least 12 characters')
  .regex(/[A-Z]/, 'Include an uppercase letter')
  .regex(/[a-z]/, 'Include a lowercase letter')
  .regex(/[0-9]/, 'Include a number')
  .regex(/[^A-Za-z0-9]/, 'Include a special character');

export const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: strongPassword,
  confirmPassword: z.string(),
  clinicName: z.string().min(1, 'Clinic name is required'),
  country: z.string().min(2, 'Select a country'),
  phone: z.string().min(6, 'Enter a valid phone number'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Helper: transforms empty strings to null before validation
const emptyToNull = z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional());
const emailOrEmpty = z.preprocess((val) => (val === '' ? null : val), z.string().email().nullable().optional());
const numericOrNull = z.preprocess(
  (val) => {
    if (val === '' || val === null || val === undefined) return null;
    const n = typeof val === 'number' ? val : Number(val);
    return Number.isFinite(n) ? n : null;
  },
  z.number().positive('Enter a positive number').nullable().optional()
);

export const patientSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  date_of_birth: z.string().min(1, 'Date of birth is required'),
  sex: z.enum(['male', 'female', 'other']),
  email: emailOrEmpty,
  phone: emptyToNull,
  mrn: emptyToNull,
  medicare_number: emptyToNull,
  ihi: emptyToNull,
  allergies: z.array(z.string()).default([]),
  conditions: z.array(z.string()).default([]),
  consent_status: z.enum(['granted', 'revoked', 'pending']).default('pending'),
  notes: emptyToNull,
  // Care context (Phase 3) — last_appointment_at is app-maintained, not in the form.
  height_cm: numericOrNull,
  provider_name: emptyToNull,
  location: emptyToNull,
});

export const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  specialty: z.string().nullable().optional(),
  provider_number: z.string().nullable().optional(),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type SignupInput = z.infer<typeof signupSchema>;
export type PatientInput = z.infer<typeof patientSchema>;
export type ProfileInput = z.infer<typeof profileSchema>;
