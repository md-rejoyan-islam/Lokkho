import { MockTestAttempt } from "./mock-tests.model";

export function listMockTests(userId: any, query: any) {
  const filter: any = { userId };
  if (query.moduleId) filter.moduleId = query.moduleId;
  return MockTestAttempt.find(filter).populate("moduleId", "title category").sort({ createdAt: -1 });
}

// Record an attempt; score auto-computed from answers.
export function createMockTest(userId: any, body: any) {
  const answers = body.answers || [];
  const score = answers.filter((a: any) => a.correct).length;
  return MockTestAttempt.create({
    userId,
    moduleId: body.moduleId,
    answers,
    score,
    total: body.total ?? answers.length,
  });
}
