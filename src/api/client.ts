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
  analysisJson?: Record<string, unknown>;
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
  parts?: Array<{ type?: string; text?: string } | string>;
  metadata?: { turnStatus?: string; [key: string]: unknown };
}

export interface NutritionItem {
  id?: string;
  name: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
  sugar?: number;
  meal?: string;
  logged_at?: string;
  amount?: number;
  unit?: string;
  quantity?: string;
  waterMl?: number;
}

export interface NutritionDayTotals {
  id?: string;
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  waterMl: number;
  targetCalories?: number;
  targetProtein?: number;
  targetCarbs?: number;
  targetFat?: number;
  items?: NutritionItem[];
  meals?: {
    breakfast?: NutritionItem[];
    lunch?: NutritionItem[];
    dinner?: NutritionItem[];
    snacks?: NutritionItem[];
  };
}

export interface LogMealQueryResult {
  success: boolean;
  message?: string;
  parsedItems?: NutritionItem[];
  nutrition?: NutritionDayTotals;
}

export function parseAiStreamText(streamOutput: string): string {
  if (!streamOutput || typeof streamOutput !== "string") return "";
  const lines = streamOutput.split("\n");
  let accumulated = "";
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.startsWith("0:")) {
      try {
        const jsonStr = trimmed.slice(2);
        const textChunk = JSON.parse(jsonStr);
        if (typeof textChunk === "string") {
          accumulated += textChunk;
        }
      } catch {
        accumulated += trimmed.slice(2).replace(/^"(.*)"$/, "$1");
      }
    }
  }
  return accumulated.trim();
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

    try {
      return JSON.parse(responseText) as T;
    } catch {
      return responseText as unknown as T;
    }
  }

  public static async getTodayRecommendation(): Promise<RecommendationResponse | null> {
    return this.request<RecommendationResponse | null>(
      "/api/recommendations/today",
    );
  }

  public static async getRecentWorkouts(limit = 30): Promise<Workout[]> {
    const res = await this.request<Workout[] | { workouts: Workout[] } | null>(
      `/api/workouts?limit=${limit}`,
    );
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (
      typeof res === "object" &&
      "workouts" in res &&
      Array.isArray(res.workouts)
    )
      return res.workouts;
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
    if (
      typeof res === "object" &&
      "wellness" in res &&
      Array.isArray(res.wellness)
    )
      return res.wellness;
    return [];
  }

  public static async askCoach(prompt: string): Promise<string> {
    // 1. Create chat room
    const roomRes = await this.request<{ roomId: string }>("/api/chat/rooms", {
      method: "POST",
    });
    const roomId = roomRes.roomId;

    // 2. Post user message to chat room (handles stream response)
    const baseUrl = getBaseUrl();
    const authHeaders = await getAuthHeader();
    const postRes = await fetch(`${baseUrl}/api/chat/messages`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/plain, */*",
        ...authHeaders,
      },
      body: JSON.stringify({
        roomId,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!postRes.ok) {
      const errorText = await postRes.text().catch(() => "");
      let errorMessage = `Failed to send message (${postRes.status})`;
      try {
        const parsed = JSON.parse(errorText);
        if (parsed.message) errorMessage = parsed.message;
      } catch {
        if (errorText) errorMessage = errorText;
      }
      throw new Error(errorMessage);
    }

    // Attempt direct stream extraction if postRes returned streamed text
    const streamedBodyText = await postRes.text().catch(() => "");
    const parsedStreamText = parseAiStreamText(streamedBodyText);
    if (parsedStreamText.length > 0) {
      return parsedStreamText;
    }

    // 3. Fallback: Poll for completed AI response (up to 25 seconds)
    let lastSeenText = "";
    let stableCount = 0;

    const maxAttempts = 25;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const rawRes = await this.request<
        | ChatMessage[]
        | { messages?: ChatMessage[]; data?: ChatMessage[] }
        | null
      >(`/api/chat/messages?roomId=${roomId}`);

      const messages: ChatMessage[] = Array.isArray(rawRes)
        ? rawRes
        : Array.isArray(rawRes?.messages)
          ? rawRes.messages
          : Array.isArray(rawRes?.data)
            ? rawRes.data
            : [];

      if (messages.length > 0) {
        const assistantMsg = [...messages]
          .reverse()
          .find((m) => m.role === "assistant");

        if (assistantMsg) {
          let textContent = "";

          if (
            typeof assistantMsg.content === "string" &&
            assistantMsg.content.trim().length > 0
          ) {
            textContent = assistantMsg.content.trim();
          } else if (Array.isArray(assistantMsg.parts)) {
            textContent = assistantMsg.parts
              .map((p) => {
                if (typeof p === "string") return p;
                if (p && typeof p.text === "string") return p.text;
                return "";
              })
              .filter(Boolean)
              .join("\n")
              .trim();
          }

          if (textContent.length > 0) {
            const turnStatus = assistantMsg.metadata?.turnStatus
              ?.toString()
              .toUpperCase();
            const isCompleted =
              turnStatus === "COMPLETED" ||
              turnStatus === "DONE" ||
              turnStatus === "FINISHED" ||
              turnStatus === "SUCCESS";

            if (isCompleted) {
              return textContent;
            }

            if (textContent === lastSeenText) {
              stableCount++;
              if (stableCount >= 2) {
                return textContent;
              }
            } else {
              lastSeenText = textContent;
              stableCount = 0;
            }
          }
        }
      }
    }

    if (lastSeenText.length > 0) {
      return lastSeenText;
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

  public static async logMealByQuery(
    query: string,
    date?: string,
    mealType?: string,
  ): Promise<LogMealQueryResult> {
    const targetDate = date || new Date().toISOString().split("T")[0];
    return this.request<LogMealQueryResult>(
      `/api/nutrition/${targetDate}/log`,
      {
        method: "POST",
        body: { query, mealType },
      },
    );
  }

  public static async quickAddHydration(
    volumeMl: number,
    date?: string,
  ): Promise<{ success: boolean; waterMl?: number }> {
    const targetDate = date || new Date().toISOString().split("T")[0];
    return this.request<{ success: boolean; waterMl?: number }>(
      "/api/nutrition/hydration-quick-add",
      {
        method: "POST",
        body: { date: targetDate, volumeMl },
      },
    );
  }

  public static async logNutritionItems(
    date: string,
    items: NutritionItem[],
  ): Promise<NutritionDayTotals> {
    return this.request<NutritionDayTotals>("/api/nutrition", {
      method: "POST",
      body: { date, items },
    });
  }

  public static async getTodayNutrition(
    date?: string,
  ): Promise<NutritionDayTotals | null> {
    const targetDate = date || new Date().toISOString().split("T")[0];
    const res = await this.request<
      | NutritionDayTotals
      | NutritionDayTotals[]
      | { nutrition?: NutritionDayTotals | NutritionDayTotals[] }
      | null
    >(`/api/nutrition?startDate=${targetDate}&endDate=${targetDate}`);

    if (!res) return null;
    if (Array.isArray(res)) return res[0] || null;
    if (typeof res === "object" && "nutrition" in res && res.nutrition) {
      if (Array.isArray(res.nutrition)) return res.nutrition[0] || null;
      return res.nutrition as NutritionDayTotals;
    }
    return res as NutritionDayTotals;
  }
}
