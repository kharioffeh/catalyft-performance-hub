/**
 * @jest-environment node
 */

// Unit tests for PR Engine calculation logic
describe('PR Engine - Calculation Logic', () => {
  
  // Helper function to calculate 1RM using Epley formula
  function calculate1RM(weight: number, reps: number): number {
    return weight * (1 + reps / 30)
  }

  // Helper function to calculate 3RM
  function calculate3RM(weight: number, reps: number): number {
    return weight * (1 + reps / 10)
  }

  // Helper function to determine if a value is a new PR
  function isNewPR(newValue: number, existingPR: number | null): boolean {
    return existingPR === null || newValue > existingPR
  }

  describe('1RM Calculation (Epley Formula)', () => {
    test('should calculate 1RM correctly using Epley formula: weight * (1 + reps/30)', () => {
      // Test case 1: 100kg x 5 reps
      const oneRM1 = calculate1RM(100, 5)
      expect(oneRM1).toBeCloseTo(116.67, 2)

      // Test case 2: 120kg x 3 reps
      const oneRM2 = calculate1RM(120, 3)
      expect(oneRM2).toBeCloseTo(132, 2)

      // Test case 3: 110kg x 4 reps
      const oneRM3 = calculate1RM(110, 4)
      expect(oneRM3).toBeCloseTo(124.67, 2)
    })

    test('should identify highest 1RM from multiple calculations', () => {
      const metrics = [
        { weight: 100, reps: 5 }, // 1RM ≈ 116.67
        { weight: 120, reps: 3 }, // 1RM ≈ 132 (highest)
        { weight: 110, reps: 4 }  // 1RM ≈ 124.67
      ]

      const oneRMs = metrics.map(m => calculate1RM(m.weight, m.reps))
      const maxOneRM = Math.max(...oneRMs)

      expect(maxOneRM).toBeCloseTo(132, 1)
      expect(oneRMs.indexOf(maxOneRM)).toBe(1) // Second metric has highest 1RM
    })
  })

  describe('3RM Calculation', () => {
    test('should calculate 3RM correctly using formula: weight * (1 + reps/10)', () => {
      // Test case 1: 95kg x 6 reps
      const threeRM1 = calculate3RM(95, 6)
      expect(threeRM1).toBe(152)

      // Test case 2: 105kg x 4 reps
      const threeRM2 = calculate3RM(105, 4)
      expect(threeRM2).toBe(147)

      // Test case 3: 100kg x 5 reps
      const threeRM3 = calculate3RM(100, 5)
      expect(threeRM3).toBe(150)
    })

    test('should identify highest 3RM from multiple calculations', () => {
      const metrics = [
        { weight: 95, reps: 6 },  // 3RM = 152 (highest)
        { weight: 105, reps: 4 }, // 3RM = 147
        { weight: 100, reps: 5 }  // 3RM = 150
      ]

      const threeRMs = metrics.map(m => calculate3RM(m.weight, m.reps))
      const maxThreeRM = Math.max(...threeRMs)

      expect(maxThreeRM).toBe(152)
      expect(threeRMs.indexOf(maxThreeRM)).toBe(0) // First metric has highest 3RM
    })
  })

  describe('Velocity PR Logic', () => {
    test('should identify highest velocity value', () => {
      const velocities = [0.45, 0.52, 0.38] // 0.52 is highest
      const maxVelocity = Math.max(...velocities)

      expect(maxVelocity).toBe(0.52)
      expect(velocities.indexOf(maxVelocity)).toBe(1) // Second velocity is highest
    })
  })

  describe('PR Determination Logic', () => {
    test('should correctly identify new PRs', () => {
      // Test new PR (no existing record)
      expect(isNewPR(120, null)).toBe(true)

      // Test new PR (higher than existing)
      expect(isNewPR(125, 120)).toBe(true)

      // Test not a new PR (equal to existing)
      expect(isNewPR(120, 120)).toBe(false)

      // Test not a new PR (lower than existing)
      expect(isNewPR(115, 120)).toBe(false)
    })
  })

  describe('Integration - Multiple PR Types', () => {
    test('should calculate all PR types from single metric correctly', () => {
      const metric = {
        weight: 110,
        reps: 3,
        velocity: 0.48
      }

      const oneRM = calculate1RM(metric.weight, metric.reps)
      const threeRM = calculate3RM(metric.weight, metric.reps)
      const velocity = metric.velocity

      // Verify calculations
      expect(oneRM).toBeCloseTo(121, 1) // 110 * (1 + 3/30) = 121
      expect(threeRM).toBeCloseTo(143, 1) // 110 * (1 + 3/10) = 143
      expect(velocity).toBe(0.48)

      // Verify all values would be PRs if no existing records
      expect(isNewPR(oneRM, null)).toBe(true)
      expect(isNewPR(threeRM, null)).toBe(true)
      expect(isNewPR(velocity, null)).toBe(true)
    })
  })

  describe('Edge Cases', () => {
    test('should handle single rep correctly', () => {
      const oneRM = calculate1RM(100, 1)
      const threeRM = calculate3RM(100, 1)

      expect(oneRM).toBeCloseTo(103.33, 2) // 100 * (1 + 1/30)
      expect(threeRM).toBeCloseTo(110, 2) // 100 * (1 + 1/10)
    })

    test('should handle high rep counts correctly', () => {
      const oneRM = calculate1RM(60, 20)
      const threeRM = calculate3RM(60, 20)

      expect(oneRM).toBeCloseTo(100, 2) // 60 * (1 + 20/30) = 60 * 1.667 = 100
      expect(threeRM).toBe(180) // 60 * (1 + 20/10) = 60 * 3 = 180
    })

    test('should handle zero values appropriately', () => {
      expect(isNewPR(0, null)).toBe(true) // Zero is still a valid PR if no existing record
      expect(isNewPR(0, 100)).toBe(false) // Zero should not beat existing PR
    })
  })
})

// Mock function test to simulate the upsertMetrics function logic
describe('PR Engine - Function Logic Simulation', () => {
  interface Metric {
    userId: string
    date: string
    exercise: string
    weight?: number
    reps?: number
    velocity?: number
  }

  interface PRRecord {
    user_id: string
    exercise: string
    type: '1rm' | '3rm' | 'velocity'
    value: number
    achieved_at: string
  }

  // Mock function that simulates the PR engine logic from the upsertMetrics function
  function simulatePREngine(metric: Metric, existingPRs: PRRecord[] = []): PRRecord[] {
    const newPRs: PRRecord[] = []

    if (metric.weight && metric.reps) {
      // Calculate 1RM
      const oneRM = metric.weight * (1 + metric.reps / 30)
      const existing1RM = existingPRs.find(pr => pr.user_id === metric.userId && pr.exercise === metric.exercise && pr.type === '1rm')
      
      if (!existing1RM || oneRM > existing1RM.value) {
        newPRs.push({
          user_id: metric.userId,
          exercise: metric.exercise,
          type: '1rm',
          value: oneRM,
          achieved_at: new Date().toISOString()
        })
      }

      // Calculate 3RM
      const threeRM = metric.weight * (1 + metric.reps / 10)
      const existing3RM = existingPRs.find(pr => pr.user_id === metric.userId && pr.exercise === metric.exercise && pr.type === '3rm')
      
      if (!existing3RM || threeRM > existing3RM.value) {
        newPRs.push({
          user_id: metric.userId,
          exercise: metric.exercise,
          type: '3rm',
          value: threeRM,
          achieved_at: new Date().toISOString()
        })
      }
    }

    if (metric.velocity !== undefined) {
      const existingVelocity = existingPRs.find(pr => pr.user_id === metric.userId && pr.exercise === metric.exercise && pr.type === 'velocity')
      
      if (!existingVelocity || metric.velocity > existingVelocity.value) {
        newPRs.push({
          user_id: metric.userId,
          exercise: metric.exercise,
          type: 'velocity',
          value: metric.velocity,
          achieved_at: new Date().toISOString()
        })
      }
    }

    return newPRs
  }

  test('should create new PRs when no existing records exist', () => {
    const metric: Metric = {
      userId: 'user-123',
      date: '2024-01-01',
      exercise: 'bench press',
      weight: 100,
      reps: 5,
      velocity: 0.45
    }

    const newPRs = simulatePREngine(metric, [])

    expect(newPRs).toHaveLength(3)
    expect(newPRs.some(pr => pr.type === '1rm' && Math.abs(pr.value - 116.67) < 0.1)).toBe(true)
    expect(newPRs.some(pr => pr.type === '3rm' && pr.value === 150)).toBe(true)
    expect(newPRs.some(pr => pr.type === 'velocity' && pr.value === 0.45)).toBe(true)
  })

  test('should only create PRs that beat existing records', () => {
    const metric: Metric = {
      userId: 'user-123',
      date: '2024-01-02',
      exercise: 'bench press',
      weight: 90, // Lower weight
      reps: 5,
      velocity: 0.40 // Lower velocity
    }

    const existingPRs: PRRecord[] = [
      {
        user_id: 'user-123',
        exercise: 'bench press',
        type: '1rm',
        value: 120,
        achieved_at: '2024-01-01T00:00:00Z'
      },
      {
        user_id: 'user-123',
        exercise: 'bench press',
        type: 'velocity',
        value: 0.50,
        achieved_at: '2024-01-01T00:00:00Z'
      }
    ]

    const newPRs = simulatePREngine(metric, existingPRs)

    // Should only create 3RM PR since existing 1RM and velocity are higher
    expect(newPRs).toHaveLength(1)
    expect(newPRs[0].type).toBe('3rm')
    expect(newPRs[0].value).toBe(135) // 90 * (1 + 5/10)
  })

  test('should handle metrics with only velocity', () => {
    const metric: Metric = {
      userId: 'user-123',
      date: '2024-01-03',
      exercise: 'bench press',
      velocity: 0.55
    }

    const newPRs = simulatePREngine(metric, [])

    expect(newPRs).toHaveLength(1)
    expect(newPRs[0].type).toBe('velocity')
    expect(newPRs[0].value).toBe(0.55)
  })

  test('should handle metrics with only weight and reps', () => {
    const metric: Metric = {
      userId: 'user-123',
      date: '2024-01-04',
      exercise: 'squat',
      weight: 150,
      reps: 2
    }

    const newPRs = simulatePREngine(metric, [])

    expect(newPRs).toHaveLength(2) // 1RM and 3RM only
    expect(newPRs.some(pr => pr.type === '1rm')).toBe(true)
    expect(newPRs.some(pr => pr.type === '3rm')).toBe(true)
    expect(newPRs.some(pr => pr.type === 'velocity')).toBe(false)
  })
})