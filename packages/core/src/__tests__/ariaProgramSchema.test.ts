import { AriaProgramSchema } from "../types/ariaProgram";

describe("AriaProgramSchema", () => {
  it("validates a correct example", () => {
    const example = {
      meta: {
        goal: "max_strength",
        weeks: 8,
        metrics_available: true
      },
      blocks: [
        {
          week: 1,
          sessions: [
            {
              day: "Mon",
              session_type: "strength",
              exercises: [
                { name: "Back Squat", sets: 5, reps: 5, intensity: "80%1RM", rest_sec: 120 }
              ]
            }
          ]
        }
      ]
    };
    expect(() => AriaProgramSchema.parse(example)).not.toThrow();
  });

  it("invalid example (wrong day)", () => {
    expect(() =>
      AriaProgramSchema.parse({
        meta: { goal: "hypertrophy", weeks: 5, metrics_available: false },
        blocks: [{ week: 1, sessions: [{ day: "Mond", session_type: "strength", exercises: [] }] }]
      })
    ).toThrow();
  });
});