import type {
  GenieConfig,
  GenieTokenResponse,
  FHIRBundle,
  Patient,
  Practitioner,
  Appointment,
  Condition,
  Observation,
  AllergyIntolerance,
  DocumentReference,
  Encounter,
  FHIRResource,
  GeniePatientSearchParams,
  GenieAppointmentSearchParams,
  GenieLetterPayload,
} from "./types";

export class GenieClient {
  private config: GenieConfig;
  private accessToken: string | null = null;
  private tokenExpiresAt: number = 0;

  constructor(config: GenieConfig) {
    this.config = config;
  }

  // --- Authentication (OAuth2 Client Credentials) ---

  private async authenticate(): Promise<string> {
    if (this.accessToken && Date.now() < this.tokenExpiresAt) {
      return this.accessToken;
    }

    const response = await fetch(this.config.tokenUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        grant_type: "client_credentials",
        client_id: this.config.clientId,
        client_secret: this.config.clientSecret,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new GenieAuthError(
        `Authentication failed (${response.status}): ${errorText}`
      );
    }

    const data: GenieTokenResponse = await response.json();
    this.accessToken = data.access_token;
    // Expire 60 seconds early to avoid edge cases
    this.tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;

    return this.accessToken;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await this.authenticate();
    const url = `${this.config.fhirBaseUrl}${path}`;

    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/fhir+json",
        "Content-Type": "application/fhir+json",
        ...options.headers,
      },
    });

    if (response.status === 401) {
      // Token may have expired, retry once
      this.accessToken = null;
      const newToken = await this.authenticate();
      const retryResponse = await fetch(url, {
        ...options,
        headers: {
          Authorization: `Bearer ${newToken}`,
          Accept: "application/fhir+json",
          "Content-Type": "application/fhir+json",
          ...options.headers,
        },
      });

      if (!retryResponse.ok) {
        throw new GenieApiError(
          `Request failed after re-auth (${retryResponse.status}): ${await retryResponse.text()}`,
          retryResponse.status
        );
      }

      return retryResponse.json();
    }

    if (!response.ok) {
      throw new GenieApiError(
        `Request failed (${response.status}): ${await response.text()}`,
        response.status
      );
    }

    return response.json();
  }

  // --- Patient API ---

  async searchPatients(
    params: GeniePatientSearchParams
  ): Promise<FHIRBundle<Patient>> {
    const searchParams = new URLSearchParams();
    if (params.family) searchParams.set("family", params.family);
    if (params.given) searchParams.set("given", params.given);
    if (params.birthdate) searchParams.set("birthdate", params.birthdate);
    if (params.identifier) searchParams.set("identifier", params.identifier);
    if (params.phone) searchParams.set("phone", params.phone);
    if (params.email) searchParams.set("email", params.email);
    if (params._count) searchParams.set("_count", String(params._count));

    const query = searchParams.toString();
    return this.request<FHIRBundle<Patient>>(
      `/Patient${query ? `?${query}` : ""}`
    );
  }

  async getPatient(patientId: string): Promise<Patient> {
    return this.request<Patient>(`/Patient/${patientId}`);
  }

  // --- Practitioner API ---

  async searchPractitioners(
    params: { name?: string; identifier?: string; _count?: number } = {}
  ): Promise<FHIRBundle<Practitioner>> {
    const searchParams = new URLSearchParams();
    if (params.name) searchParams.set("name", params.name);
    if (params.identifier) searchParams.set("identifier", params.identifier);
    if (params._count) searchParams.set("_count", String(params._count));

    const query = searchParams.toString();
    return this.request<FHIRBundle<Practitioner>>(
      `/Practitioner${query ? `?${query}` : ""}`
    );
  }

  async getPractitioner(practitionerId: string): Promise<Practitioner> {
    return this.request<Practitioner>(`/Practitioner/${practitionerId}`);
  }

  // --- Appointments API ---

  async searchAppointments(
    params: GenieAppointmentSearchParams
  ): Promise<FHIRBundle<Appointment>> {
    const searchParams = new URLSearchParams();
    if (params.patient) searchParams.set("patient", params.patient);
    if (params.practitioner)
      searchParams.set("practitioner", params.practitioner);
    if (params.date) searchParams.set("date", params.date);
    if (params.status) searchParams.set("status", params.status);
    if (params._count) searchParams.set("_count", String(params._count));

    const query = searchParams.toString();
    return this.request<FHIRBundle<Appointment>>(
      `/Appointment${query ? `?${query}` : ""}`
    );
  }

  async getAppointment(appointmentId: string): Promise<Appointment> {
    return this.request<Appointment>(`/Appointment/${appointmentId}`);
  }

  // --- Clinical Data (Pull) ---

  async getPatientConditions(
    patientId: string,
    params: { clinical_status?: string; _count?: number } = {}
  ): Promise<FHIRBundle<Condition>> {
    const searchParams = new URLSearchParams({ patient: patientId });
    if (params.clinical_status)
      searchParams.set("clinical-status", params.clinical_status);
    if (params._count) searchParams.set("_count", String(params._count));

    return this.request<FHIRBundle<Condition>>(
      `/Condition?${searchParams.toString()}`
    );
  }

  async getPatientObservations(
    patientId: string,
    params: { category?: string; code?: string; _count?: number } = {}
  ): Promise<FHIRBundle<Observation>> {
    const searchParams = new URLSearchParams({ patient: patientId });
    if (params.category) searchParams.set("category", params.category);
    if (params.code) searchParams.set("code", params.code);
    if (params._count) searchParams.set("_count", String(params._count));

    return this.request<FHIRBundle<Observation>>(
      `/Observation?${searchParams.toString()}`
    );
  }

  async getPatientAllergies(
    patientId: string,
    params: { clinical_status?: string; _count?: number } = {}
  ): Promise<FHIRBundle<AllergyIntolerance>> {
    const searchParams = new URLSearchParams({ patient: patientId });
    if (params.clinical_status)
      searchParams.set("clinical-status", params.clinical_status);
    if (params._count) searchParams.set("_count", String(params._count));

    return this.request<FHIRBundle<AllergyIntolerance>>(
      `/AllergyIntolerance?${searchParams.toString()}`
    );
  }

  async getPatientEncounters(
    patientId: string,
    params: { status?: string; date?: string; _count?: number } = {}
  ): Promise<FHIRBundle<Encounter>> {
    const searchParams = new URLSearchParams({ patient: patientId });
    if (params.status) searchParams.set("status", params.status);
    if (params.date) searchParams.set("date", params.date);
    if (params._count) searchParams.set("_count", String(params._count));

    return this.request<FHIRBundle<Encounter>>(
      `/Encounter?${searchParams.toString()}`
    );
  }

  /**
   * Pull a comprehensive patient summary including demographics,
   * conditions, allergies, and recent observations.
   */
  async getPatientSummary(patientId: string) {
    const [patient, conditions, allergies, observations] = await Promise.all([
      this.getPatient(patientId),
      this.getPatientConditions(patientId, { clinical_status: "active" }),
      this.getPatientAllergies(patientId, { clinical_status: "active" }),
      this.getPatientObservations(patientId, { _count: 20 }),
    ]);

    return {
      patient,
      conditions: conditions.entry?.map((e) => e.resource) ?? [],
      allergies: allergies.entry?.map((e) => e.resource) ?? [],
      observations: observations.entry?.map((e) => e.resource) ?? [],
    };
  }

  // --- Letters / Clinical Notes (Push) ---

  /**
   * Push a clinical note or letter back to Genie as a DocumentReference.
   * This creates a letter in Genie's outgoing correspondence.
   */
  async pushClinicalNote(
    payload: GenieLetterPayload
  ): Promise<DocumentReference> {
    const contentType = payload.contentType ?? "text/plain";
    const encodedContent = Buffer.from(payload.content).toString("base64");

    const documentReference: DocumentReference = {
      resourceType: "DocumentReference",
      status: "current",
      type: {
        coding: [
          {
            system: "http://loinc.org",
            code: this.getLoincCodeForLetterType(payload.letterType),
            display: this.getDisplayForLetterType(payload.letterType),
          },
        ],
        text: this.getDisplayForLetterType(payload.letterType),
      },
      category: [
        {
          coding: [
            {
              system:
                "http://hl7.org/fhir/us/core/CodeSystem/us-core-documentreference-category",
              code: "clinical-note",
              display: "Clinical Note",
            },
          ],
        },
      ],
      subject: {
        reference: `Patient/${payload.patientId}`,
      },
      date: payload.date ?? new Date().toISOString(),
      author: payload.practitionerId
        ? [{ reference: `Practitioner/${payload.practitionerId}` }]
        : undefined,
      description: payload.title,
      content: [
        {
          attachment: {
            contentType,
            data: encodedContent,
            title: payload.title,
            creation: new Date().toISOString(),
          },
        },
      ],
    };

    return this.request<DocumentReference>("/DocumentReference", {
      method: "POST",
      body: JSON.stringify(documentReference),
    });
  }

  /**
   * Push a referral letter to Genie.
   */
  async pushReferralLetter(
    payload: GenieLetterPayload
  ): Promise<DocumentReference> {
    return this.pushClinicalNote({
      ...payload,
      letterType: "referral",
    });
  }

  /**
   * Push a discharge summary to Genie.
   */
  async pushDischargeSummary(
    payload: GenieLetterPayload
  ): Promise<DocumentReference> {
    return this.pushClinicalNote({
      ...payload,
      letterType: "discharge-summary",
    });
  }

  // --- FHIR Resource Helpers ---

  async getResource<T extends FHIRResource>(
    resourceType: string,
    id: string
  ): Promise<T> {
    return this.request<T>(`/${resourceType}/${id}`);
  }

  async searchResources<T extends FHIRResource>(
    resourceType: string,
    params: Record<string, string> = {}
  ): Promise<FHIRBundle<T>> {
    const searchParams = new URLSearchParams(params);
    const query = searchParams.toString();
    return this.request<FHIRBundle<T>>(
      `/${resourceType}${query ? `?${query}` : ""}`
    );
  }

  // --- Private Helpers ---

  private getLoincCodeForLetterType(type: GenieLetterPayload["letterType"]): string {
    const codes: Record<GenieLetterPayload["letterType"], string> = {
      "clinical-note": "11506-3",
      referral: "57133-1",
      "discharge-summary": "18842-5",
      correspondence: "34133-9",
    };
    return codes[type];
  }

  private getDisplayForLetterType(type: GenieLetterPayload["letterType"]): string {
    const displays: Record<GenieLetterPayload["letterType"], string> = {
      "clinical-note": "Progress Note",
      referral: "Referral Note",
      "discharge-summary": "Discharge Summary",
      correspondence: "Clinical Correspondence",
    };
    return displays[type];
  }
}

// --- Error Classes ---

export class GenieAuthError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GenieAuthError";
  }
}

export class GenieApiError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "GenieApiError";
    this.statusCode = statusCode;
  }
}
