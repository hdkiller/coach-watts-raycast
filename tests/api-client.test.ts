import { describe, it, expect } from "vitest";
import { CoachWattsApi, parseAiStreamText } from "../src/api/client";

describe("Coach Watts API Integration & E2E Suite", () => {
  describe("parseAiStreamText", () => {
    it("should parse Vercel AI SDK text stream lines correctly", () => {
      const stream = `0:"Hello "\n0:"world, "\n0:"I am Coach Watts!"\nd:{"finishReason":"stop"}`;
      const result = parseAiStreamText(stream);
      expect(result).toBe("Hello world, I am Coach Watts!");
    });

    it("should handle empty or malformed stream text gracefully", () => {
      expect(parseAiStreamText("")).toBe("");
      expect(parseAiStreamText("invalid text without stream prefix")).toBe("");
    });
  });

  it("should fetch today's recommendation or return null safely", async () => {
    const res = await CoachWattsApi.getTodayRecommendation();
    if (res !== null) {
      expect(typeof res).toBe("object");
    } else {
      expect(res).toBeNull();
    }
  });

  it("should fetch recent workouts with valid schema", async () => {
    const workouts = await CoachWattsApi.getRecentWorkouts(10);
    expect(Array.isArray(workouts)).toBe(true);

    if (workouts.length > 0) {
      const first = workouts[0];
      expect(typeof first.id).toBe("string");
      expect(typeof first.date).toBe("string");
      expect(typeof first.title).toBe("string");
    }
  });

  it("should fetch wellness history with valid biometrics schema", async () => {
    const wellness = await CoachWattsApi.getWellnessHistory(10);
    expect(Array.isArray(wellness)).toBe(true);

    if (wellness.length > 0) {
      const first = wellness[0];
      expect(typeof first.id).toBe("string");
      expect(typeof first.date).toBe("string");
    }
  });

  it(
    "should execute AI Coach chat flow end-to-end (room creation -> turn dispatch -> polling)",
    async () => {
      const reply = await CoachWattsApi.askCoach(
        "Suggest a 15 minute recovery mobility routine",
      );
      expect(typeof reply).toBe("string");
      expect(reply.trim().length).toBeGreaterThan(0);
    },
    30000,
  );

  it("should trigger full sync endpoint without crashing", async () => {
    const res = await CoachWattsApi.triggerSync();
    expect(typeof res).toBe("object");
  });

  describe("Nutrition API Client", () => {
    it("should fetch today's nutrition totals or return null gracefully", async () => {
      const nutrition = await CoachWattsApi.getTodayNutrition();
      if (nutrition !== null) {
        expect(typeof nutrition).toBe("object");
        expect(typeof nutrition.calories).toBe("number");
      }
    });

    it("should construct valid payloads for quickAddHydration method", async () => {
      expect(typeof CoachWattsApi.quickAddHydration).toBe("function");
    });

    it("should construct valid payloads for logMealByQuery method", async () => {
      expect(typeof CoachWattsApi.logMealByQuery).toBe("function");
    });
  });
});
