// FHIR R4 resource types for Genie Solutions integration

export interface FHIRResource {
  resourceType: string;
  id?: string;
  meta?: {
    versionId?: string;
    lastUpdated?: string;
    profile?: string[];
  };
}

export interface FHIRBundle<T extends FHIRResource = FHIRResource> {
  resourceType: "Bundle";
  type: "searchset" | "batch" | "transaction" | "collection";
  total?: number;
  link?: Array<{
    relation: string;
    url: string;
  }>;
  entry?: Array<{
    fullUrl?: string;
    resource: T;
  }>;
}

// --- Patient ---

export interface HumanName {
  use?: "official" | "usual" | "nickname" | "old";
  family?: string;
  given?: string[];
  prefix?: string[];
  suffix?: string[];
  text?: string;
}

export interface ContactPoint {
  system?: "phone" | "fax" | "email" | "pager" | "url" | "sms";
  value?: string;
  use?: "home" | "work" | "temp" | "old" | "mobile";
}

export interface Address {
  use?: "home" | "work" | "temp" | "old" | "billing";
  type?: "postal" | "physical" | "both";
  text?: string;
  line?: string[];
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
  country?: string;
}

export interface Identifier {
  use?: "usual" | "official" | "temp" | "secondary" | "old";
  system?: string;
  value?: string;
  type?: {
    coding?: Array<{
      system?: string;
      code?: string;
      display?: string;
    }>;
    text?: string;
  };
}

export interface Patient extends FHIRResource {
  resourceType: "Patient";
  identifier?: Identifier[];
  active?: boolean;
  name?: HumanName[];
  telecom?: ContactPoint[];
  gender?: "male" | "female" | "other" | "unknown";
  birthDate?: string;
  address?: Address[];
  maritalStatus?: {
    coding?: Array<{ system?: string; code?: string; display?: string }>;
    text?: string;
  };
  generalPractitioner?: Array<{
    reference?: string;
    display?: string;
  }>;
}

// --- Practitioner ---

export interface Practitioner extends FHIRResource {
  resourceType: "Practitioner";
  identifier?: Identifier[];
  active?: boolean;
  name?: HumanName[];
  telecom?: ContactPoint[];
  gender?: "male" | "female" | "other" | "unknown";
  qualification?: Array<{
    code: {
      coding?: Array<{ system?: string; code?: string; display?: string }>;
      text?: string;
    };
    issuer?: { display?: string };
  }>;
}

// --- Appointment ---

export interface Appointment extends FHIRResource {
  resourceType: "Appointment";
  status:
    | "proposed"
    | "pending"
    | "booked"
    | "arrived"
    | "fulfilled"
    | "cancelled"
    | "noshow";
  serviceType?: Array<{
    coding?: Array<{ system?: string; code?: string; display?: string }>;
    text?: string;
  }>;
  start?: string;
  end?: string;
  description?: string;
  participant?: Array<{
    actor?: {
      reference?: string;
      display?: string;
    };
    status: "accepted" | "declined" | "tentative" | "needs-action";
    type?: Array<{
      coding?: Array<{ system?: string; code?: string; display?: string }>;
    }>;
  }>;
  reasonCode?: Array<{
    coding?: Array<{ system?: string; code?: string; display?: string }>;
    text?: string;
  }>;
}

// --- Condition ---

export interface Condition extends FHIRResource {
  resourceType: "Condition";
  clinicalStatus?: {
    coding?: Array<{ system?: string; code?: string; display?: string }>;
  };
  verificationStatus?: {
    coding?: Array<{ system?: string; code?: string; display?: string }>;
  };
  category?: Array<{
    coding?: Array<{ system?: string; code?: string; display?: string }>;
  }>;
  code?: {
    coding?: Array<{ system?: string; code?: string; display?: string }>;
    text?: string;
  };
  subject: {
    reference?: string;
    display?: string;
  };
  onsetDateTime?: string;
  recordedDate?: string;
  note?: Array<{ text?: string }>;
}

// --- Observation ---

export interface Observation extends FHIRResource {
  resourceType: "Observation";
  status: "registered" | "preliminary" | "final" | "amended" | "cancelled";
  category?: Array<{
    coding?: Array<{ system?: string; code?: string; display?: string }>;
  }>;
  code: {
    coding?: Array<{ system?: string; code?: string; display?: string }>;
    text?: string;
  };
  subject?: {
    reference?: string;
    display?: string;
  };
  effectiveDateTime?: string;
  valueQuantity?: {
    value?: number;
    unit?: string;
    system?: string;
    code?: string;
  };
  valueString?: string;
  interpretation?: Array<{
    coding?: Array<{ system?: string; code?: string; display?: string }>;
  }>;
}

// --- AllergyIntolerance ---

export interface AllergyIntolerance extends FHIRResource {
  resourceType: "AllergyIntolerance";
  clinicalStatus?: {
    coding?: Array<{ system?: string; code?: string; display?: string }>;
  };
  verificationStatus?: {
    coding?: Array<{ system?: string; code?: string; display?: string }>;
  };
  type?: "allergy" | "intolerance";
  category?: Array<"food" | "medication" | "environment" | "biologic">;
  criticality?: "low" | "high" | "unable-to-assess";
  code?: {
    coding?: Array<{ system?: string; code?: string; display?: string }>;
    text?: string;
  };
  patient: {
    reference?: string;
    display?: string;
  };
  recordedDate?: string;
  reaction?: Array<{
    substance?: {
      coding?: Array<{ system?: string; code?: string; display?: string }>;
      text?: string;
    };
    manifestation: Array<{
      coding?: Array<{ system?: string; code?: string; display?: string }>;
      text?: string;
    }>;
    severity?: "mild" | "moderate" | "severe";
  }>;
}

// --- DocumentReference (for pushing clinical notes) ---

export interface DocumentReference extends FHIRResource {
  resourceType: "DocumentReference";
  status: "current" | "superseded" | "entered-in-error";
  type?: {
    coding?: Array<{ system?: string; code?: string; display?: string }>;
    text?: string;
  };
  category?: Array<{
    coding?: Array<{ system?: string; code?: string; display?: string }>;
    text?: string;
  }>;
  subject?: {
    reference?: string;
    display?: string;
  };
  date?: string;
  author?: Array<{
    reference?: string;
    display?: string;
  }>;
  description?: string;
  content: Array<{
    attachment: {
      contentType?: string;
      data?: string; // base64-encoded
      url?: string;
      title?: string;
      creation?: string;
    };
  }>;
}

// --- Encounter ---

export interface Encounter extends FHIRResource {
  resourceType: "Encounter";
  status:
    | "planned"
    | "arrived"
    | "triaged"
    | "in-progress"
    | "onleave"
    | "finished"
    | "cancelled";
  class?: {
    system?: string;
    code?: string;
    display?: string;
  };
  type?: Array<{
    coding?: Array<{ system?: string; code?: string; display?: string }>;
    text?: string;
  }>;
  subject?: {
    reference?: string;
    display?: string;
  };
  participant?: Array<{
    individual?: {
      reference?: string;
      display?: string;
    };
  }>;
  period?: {
    start?: string;
    end?: string;
  };
  reasonCode?: Array<{
    coding?: Array<{ system?: string; code?: string; display?: string }>;
    text?: string;
  }>;
}

// --- Genie-specific types ---

export interface GenieConfig {
  clientId: string;
  clientSecret: string;
  fhirBaseUrl: string;
  tokenUrl: string;
  practiceId?: string;
}

export interface GenieTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope?: string;
}

export interface GenieLetterPayload {
  patientId: string;
  practitionerId?: string;
  letterType: "clinical-note" | "referral" | "discharge-summary" | "correspondence";
  title: string;
  content: string;
  contentType?: "text/plain" | "text/html";
  date?: string;
}

export type GeniePatientSearchParams = {
  family?: string;
  given?: string;
  birthdate?: string;
  identifier?: string;
  phone?: string;
  email?: string;
  _count?: number;
};

export type GenieAppointmentSearchParams = {
  patient?: string;
  practitioner?: string;
  date?: string;
  status?: string;
  _count?: number;
};
