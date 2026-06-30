import {
  API_ROUTES,
  type HealthcheckResult,
} from "@financial-healthcheck/shared";

export async function fetchHealthcheck(): Promise<HealthcheckResult> {
  const response = await fetch(API_ROUTES.healthcheck);

  if (!response.ok) {
    throw new Error("Failed to fetch healthcheck data");
  }

  return response.json() as Promise<HealthcheckResult>;
}
