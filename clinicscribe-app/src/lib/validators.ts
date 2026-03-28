import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const signupSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  clinicName: z.string().min(1, 'Clinic name is required'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

// Helper: transforms empty strings to null before validation
const emptyToNull = z.preprocess((val) => (val === '' ? null : val), z.string().nullable().optional());
const emailOrEmpty = z.preprocess((val) => (val === '' ? null : val), z.string().email().nullable().optional());

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
