export { GenieClient, GenieAuthError, GenieApiError } from "./client";
export { handleGenieError } from "./error-handler";
export { parseCount, isValidFhirId, isContentWithinLimit, stripHtml } from "./validation";
export type {
  FHIRResource,
  FHIRBundle,
  Patient,
  Practitioner,
  Appointment,
  Condition,
  Observation,
  AllergyIntolerance,
  DocumentReference,
  Encounter,
  HumanName,
  ContactPoint,
  Address,
  Identifier,
  GenieConfig,
  GenieTokenResponse,
  GenieLetterPayload,
  GeniePatientSearchParams,
  GenieAppointmentSearchParams,
} from "./types";

import { GenieClient } from "./client";
import type { GenieConfig } from "./types";

let _clientInstance: GenieClient | null = null;

/**
 * Get a singleton GenieClient instance using environment variables.
 * Throws if required env vars are missing.
 */
export function getGenieClient(): GenieClient {
  if (_clientInstance) return _clientInstance;

  const config: GenieConfig = {
    clientId: requireEnv("GENIE_CLIENT_ID"),
    clientSecret: requireEnv("GENIE_CLIENT_SECRET"),
    fhirBaseUrl: requireEnv("GENIE_FHIR_BASE_URL"),
    tokenUrl: requireEnv("GENIE_TOKEN_URL"),
    practiceId: process.env.GENIE_PRACTICE_ID,
  };

  _clientInstance = new GenieClient(config);
  return _clientInstance;
}

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(
      `Missing required environment variable: ${name}. See .env.example for setup.`
    );
  }
  return value;
}
