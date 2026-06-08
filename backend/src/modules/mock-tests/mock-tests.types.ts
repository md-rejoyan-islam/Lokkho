import type { z } from "zod";
import type { mockTestSchema } from "./mock-tests.schema";

export type MockTestInput = z.infer<typeof mockTestSchema>;

export type { IMockTestAttempt, MockAnswer } from "./mock-tests.model";
