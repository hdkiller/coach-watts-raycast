import { describe, it, expect } from "vitest";
import { CoachWattsApi } from "../src/api/client";

describe("Coach Watts API Integration & E2E Suite", () => {
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
});
