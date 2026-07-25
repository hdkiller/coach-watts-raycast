import { getAuthHeader, getBaseUrl, getWebUrl } from "./oauth";

export { getWebUrl };

export interface RecommendationResponse {
  id?: string;
  date?: string;
  status?: string;
  summary?: string;
  actionableAdvice?: string;
  recommendationText?: string;
  targetDurationMinutes?: number;
  targetTss?: number;
  sportType?: string;
  intensity?: string;
  confidenceScore?: number;
  recommendation?: {
    summary?: string;
    actionableAdvice?: string;
    recommendationText?: string;
    sportType?: string;
    intensity?: string;
    targetDurationMinutes?: number;
    targetTss?: number;
  };
}

export interface Workout {
  id: string;
  title: string;
  date: string;
  type?: string;
  durationSec?: number;
  distanceMeters?: number;
  tss?: number;
  averageWatts?: number;
  normalizedPower?: number;
  averageHr?: number;
  maxHr?: number;
  elevationGain?: number;
  intensity?: number;
  kilojoules?: number;
  source?: string;
}

export interface WellnessRecord {
  id: string;
  date: string;
  hrv?: number;
  rhr?: number;
  sleepHours?: number;
  sleepScore?: number;
  recoveryScore?: number;
  readinessScore?: number;
  weight?: number;
  ctl?: number;
  atl?: number;
  tsb?: number;
  stress?: number;
  notes?: string;
}

export interface ChatResponse {
  message?: string;
  response?: string;
  reply?: string;
  text?: string;
}

export class CoachWattsApi {
  private static async request<T>(
    endpoint: string,
    options: { method?: string; body?: unknown } = {},
  ): Promise<T> {
    const baseUrl = getBaseUrl();
    const url = `${baseUrl}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;

    const authHeaders = await getAuthHeader();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      Accept: "application/json",
      ...authHeaders,
    };

    const response = await fetch(url, {
      method: options.method || "GET",
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    const responseText = await response.text().catch(() => "");

    if (!response.ok) {
      let errorMessage = `Server error ${response.status}: ${response.statusText}`;
      try {
        const parsed = JSON.parse(responseText);
        if (parsed.message) errorMessage = parsed.message;
        if (parsed.statusMessage) errorMessage = parsed.statusMessage;
        if (parsed.error_description) errorMessage = parsed.error_description;
      } catch {
        if (responseText) errorMessage = responseText;
      }
      throw new Error(errorMessage);
    }

    if (
      !responseText ||
      responseText.trim().length === 0 ||
      responseText.trim() === "null"
    ) {
      return null as unknown as T;
    }

    return JSON.parse(responseText) as T;
  }

  public static async getTodayRecommendation(): Promise<RecommendationResponse | null> {
    return this.request<RecommendationResponse | null>("/api/recommendations/today");
  }

  public static async getRecentWorkouts(limit = 30): Promise<Workout[]> {
    const res = await this.request<Workout[] | { workouts: Workout[] } | null>(
      `/api/workouts?limit=${limit}`,
    );
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if ("workouts" in res && Array.isArray(res.workouts)) return res.workouts;
    return [];
  }

  public static async getWellnessHistory(
    limit = 14,
  ): Promise<WellnessRecord[]> {
    const res = await this.request<
      WellnessRecord[] | { wellness: WellnessRecord[] } | null
    >(`/api/wellness?limit=${limit}`);
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if ("wellness" in res && Array.isArray(res.wellness)) return res.wellness;
    return [];
  }

  public static async askCoach(prompt: string): Promise<string> {
    const res = await this.request<ChatResponse>("/api/chat/messages", {
      method: "POST",
      body: { message: prompt },
    });
    return (
      res?.response ||
      res?.reply ||
      res?.text ||
      res?.message ||
      "No response text returned from AI Coach."
    );
  }

  public static async triggerSync(): Promise<{
    success: boolean;
    message?: string;
  }> {
    return this.request<{ success: boolean; message?: string }>(
      "/api/orchestrate/full-sync",
      {
        method: "POST",
      },
    );
  }
}
