export type HealthcheckCategory =
  | "savings"
  | "debt"
  | "budget"
  | "investments";

export interface HealthcheckResult {
  id: string;
  score: number;
  categories: Record<HealthcheckCategory, number>;
  createdAt: string;
}

export const API_ROUTES = {
  health: "/api/health",
  healthcheck: "/api/healthcheck",
} as const;
