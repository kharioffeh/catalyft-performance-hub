# Edge Functions Instrumentation Summary

## Overview
Successfully instrumented all Edge Functions to publish events via Ably after DB mutations as requested in **cur-sync-02**.

## Functions Instrumented

### ✅ Workout Functions
1. **createWorkout** → `sessionCreated`
   - File: `/supabase/functions/createWorkout/index.ts`
   - Event: `sessionCreated` with payload `{ session_id }`
   - Test: `/tests/createWorkout.test.ts`

2. **logSet** → `setLogged`
   - File: `/supabase/functions/logSet/index.ts`
   - Event: `setLogged` with payload `{ session_id, set_id }`
   - Test: `/tests/logSet.test.ts`

3. **endWorkout** → `sessionEnded`
   - File: `/supabase/functions/endWorkout/index.ts`
   - Event: `sessionEnded` with payload `{ session_id }`
   - Test: `/tests/endWorkout.test.ts`

4. **generateFinishers** → `finisherAssigned`
   - File: `/supabase/functions/generateFinishers/index.ts`
   - Event: `finisherAssigned` with payload `{ session_id, protocol_id }`
   - Test: Updated `/tests/generateFinishers.test.ts`

### ✅ Metrics Functions
5. **upsertMetrics** → `metricsUpdated`
   - File: `/supabase/functions/upsertMetrics/index.ts`
   - Event: `metricsUpdated` with payload `{ date }`
   - Test: Updated `/supabase/tests/upsertMetrics.test.ts`

### ✅ Social Functions
6. **createPost** → `postCreated`
   - File: `/supabase/functions/createPost/index.ts`
   - Event: `postCreated` with payload `{ post_id }`
   - Test: `/tests/createPost.test.ts`

7. **reactPost** → `postReaction`
   - File: `/supabase/functions/reactPost/index.ts`
   - Event: `postReaction` with payload `{ post_id, action, reaction_type }`
   - Test: `/tests/events-integration.test.ts`

### ✅ Club Functions
8. **joinClub** → `clubJoined`
   - File: `/supabase/functions/joinClub/index.ts`
   - Event: `clubJoined` with payload `{ club_id }`
   - Test: `/tests/events-integration.test.ts`

9. **leaveClub** → `clubLeft`
   - File: `/supabase/functions/leaveClub/index.ts`
   - Event: `clubLeft` with payload `{ club_id }`
   - Test: `/tests/events-integration.test.ts`

### ✅ Challenge Functions
10. **joinChallenge** → `challengeJoined`
    - File: `/supabase/functions/joinChallenge/index.ts`
    - Event: `challengeJoined` with payload `{ challenge_id }`
    - Test: `/tests/events-integration.test.ts`

11. **updateProgress** → `challengeProgressUpdated`
    - File: `/supabase/functions/updateProgress/index.ts`
    - Event: `challengeProgressUpdated` with payload `{ challenge_id, progress }`
    - Test: `/tests/events-integration.test.ts`

### ✅ Meet Functions
12. **createMeet** → `meetCreated`
    - File: `/supabase/functions/createMeet/index.ts`
    - Event: `meetCreated` with payload `{ meet_id }`
    - Test: `/tests/events-integration.test.ts`

13. **rsvpMeet** → `meetRSVPUpdated`
    - File: `/supabase/functions/rsvpMeet/index.ts`
    - Event: `meetRSVPUpdated` with payload `{ meet_id, rsvp_id, status }`
    - Test: `/tests/events-integration.test.ts`

## Implementation Details

### Pattern Used
All functions follow the same pattern:
```typescript
import { publishEvent } from "../_shared/ably.ts"

// ... after successful DB operation but before return ...
const uid = user.id;
publishEvent(uid, "<eventName>", { /* relevant payload */ });
```

### Test Coverage
- **Existing tests updated**: `generateFinishers.test.ts`, `upsertMetrics.test.ts`
- **New test files created**: 
  - `createWorkout.test.ts`
  - `logSet.test.ts`
  - `endWorkout.test.ts`
  - `createPost.test.ts`
  - `events-integration.test.ts` (comprehensive test for remaining functions)

### Mock Structure
All tests include:
```typescript
const mockPublishEvent = jest.fn();
jest.mock('../supabase/functions/_shared/ably.ts', () => ({
  publishEvent: mockPublishEvent
}));

// In tests:
expect(mockPublishEvent).toHaveBeenCalledTimes(1)
expect(mockPublishEvent).toHaveBeenCalledWith(
  userId, 
  "eventName", 
  { /* expected payload */ }
)
```

## Verification

### ✅ All Functions Instrumented
```bash
grep -c "publishEvent" /workspace/supabase/functions/*/index.ts | grep ":2"
```
Shows 13 functions with both import and call (2 occurrences each).

### ✅ Tests Include Assertions
All test files include `mockPublishEvent` assertions to verify:
- Event is published once per successful operation
- Correct event name is used
- Correct payload is sent
- Event is NOT published on errors

## Event Mapping Summary
| Function | Event Name | Payload |
|----------|------------|---------|
| createWorkout | sessionCreated | `{ session_id }` |
| logSet | setLogged | `{ session_id, set_id }` |
| endWorkout | sessionEnded | `{ session_id }` |
| upsertMetrics | metricsUpdated | `{ date }` |
| createPost | postCreated | `{ post_id }` |
| reactPost | postReaction | `{ post_id, action, reaction_type }` |
| joinClub | clubJoined | `{ club_id }` |
| leaveClub | clubLeft | `{ club_id }` |
| joinChallenge | challengeJoined | `{ challenge_id }` |
| updateProgress | challengeProgressUpdated | `{ challenge_id, progress }` |
| createMeet | meetCreated | `{ meet_id }` |
| rsvpMeet | meetRSVPUpdated | `{ meet_id, rsvp_id, status }` |
| generateFinishers | finisherAssigned | `{ session_id, protocol_id }` |

## Done Criteria Met ✅
- ✅ **DB mutations trigger Ably publishes**: All 13 functions now call `publishEvent` after successful DB operations
- ✅ **Tests confirm publishEvent invocation**: All functions have unit tests with mocked `publishEvent` assertions
- ✅ **CLI testing ready**: Functions can be invoked via CLI and will trigger Ably publishes (verified by local subscription)

## Next Steps
1. Deploy functions to staging/production
2. Test real Ably subscriptions with function invocations
3. Monitor event publishing in production logs