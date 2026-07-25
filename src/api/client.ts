import { getAuthHeader, getBaseUrl, getWebUrl } from "./oauth";

export { getWebUrl };

export interface RecommendationResponse {
  id?: string;
  date?: string;
  status?: string;
  summary?: string;
  recommendation?:
    | string
    | {
        summary?: string;
        actionableAdvice?: string;
        recommendationText?: string;
        sportType?: string;
        intensity?: string;
        targetDurationMinutes?: number;
        targetTss?: number;
      };
  recommendationText?: string;
  reasoning?: string;
  actionableAdvice?: string;
  analysisJson?: Record<string, any>;
  plannedWorkout?: {
    id?: string;
    title?: string;
    description?: string;
    sportType?: string;
    targetDurationSec?: number;
    targetTss?: number;
  };
  targetDurationMinutes?: number;
  targetTss?: number;
  sportType?: string;
  intensity?: string;
  confidenceScore?: number;
}

export interface Workout {
  id: string;
  title: string;
  date: string;
  type?: string;
  durationSec?: number;
  distanceMeters?: number;
  tss?: number;
  trainingLoad?: number;
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
  hrvSdnn?: number;
  rhr?: number;
  restingHr?: number;
  avgSleepingHr?: number;
  sleepHours?: number;
  sleepSecs?: number;
  sleepScore?: number;
  recoveryScore?: number;
  readinessScore?: number;
  readiness?: number;
  weight?: number;
  ctl?: number;
  atl?: number;
  tsb?: number;
  stress?: number;
  notes?: string;
  comments?: string;
}

export interface ChatMessage {
  id?: string;
  role: string;
  content?: string;
  parts?: Array<{ type: string; text?: string }>;
  metadata?: { turnStatus?: string };
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
    // 1. Create chat room
    const roomRes = await this.request<{ roomId: string }>("/api/chat/rooms", {
      method: "POST",
    });
    const roomId = roomRes.roomId;

    // 2. Post user message to chat room
    await this.request<unknown>("/api/chat/messages", {
      method: "POST",
      body: {
        roomId,
        messages: [{ role: "user", content: prompt }],
      },
    });

    // 3. Poll for completed AI response (up to 20 seconds)
    const maxAttempts = 20;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const messages = await this.request<ChatMessage[]>(
        `/api/chat/messages?roomId=${roomId}`,
      );

      if (Array.isArray(messages)) {
        const assistantMsg = [...messages]
          .reverse()
          .find((m) => m.role === "assistant");

        if (assistantMsg) {
          const textContent =
            assistantMsg.content && assistantMsg.content.trim().length > 0
              ? assistantMsg.content
              : assistantMsg.parts
                  ?.filter((p) => p.type === "text" && p.text)
                  .map((p) => p.text)
                  .join("") || "";

          if (
            textContent.trim().length > 0 &&
            assistantMsg.metadata?.turnStatus === "COMPLETED"
          ) {
            return textContent.trim();
          }
        }
      }
    }

    throw new Error("Timeout waiting for Coach Watts AI response.");
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
