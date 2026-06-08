import { env } from "../config/env";

/**
 * OpenAPI 3.0 specification for the Lokkho API.
 *
 * Served as interactive docs via `swagger-ui-express` at `/api/docs`
 * and as raw JSON at `/api/docs.json` (see `app.ts`).
 *
 * The spec is hand-authored (rather than generated from JSDoc) so the
 * documentation stays in one readable place and never drifts silently when
 * a route file is refactored.
 */

// ---- Shared enums (kept in sync with the model constants) ----
const MODULE_CATEGORIES = ["BCS", "Bank", "Primary", "NTRCA", "Railway", "Other"];
const JOB_CATEGORIES = ["government", "non_government", "other"];
const QUESTION_TYPES = ["mcq", "written"];
const RESOURCE_CATEGORIES = ["documents", "process", "tips", "circular", "general"];
const PROGRESS_STATUSES = ["not_started", "in_progress", "completed", "need_revision", "weak"];
const PRIORITIES = ["low", "medium", "high"];
const DIFFICULTIES = ["easy", "medium", "hard"];
const STAGE_STATUSES = ["pending", "passed", "failed"];
const PLAN_ITEM_STATUSES = ["pending", "completed", "missed", "rescheduled"];

// ---- Reusable response refs ----
const auth = [{ bearerAuth: [] }];
const r401 = { $ref: "#/components/responses/Unauthorized" };
const r403 = { $ref: "#/components/responses/Forbidden" };
const r404 = { $ref: "#/components/responses/NotFound" };
const r400 = { $ref: "#/components/responses/ValidationError" };

const ok = (description = "Success") => ({
  description,
  content: { "application/json": { schema: { $ref: "#/components/schemas/SuccessResponse" } } },
});

/** Build a `{ ...idParam }` path parameter. */
const idParam = (name = "id", description = "Mongo ObjectId") => ({
  name,
  in: "path",
  required: true,
  schema: { type: "string", example: "665f1c2a9b3e4a0012ab34cd" },
  description,
});

const jsonBody = (ref: string, required = true) => ({
  required,
  content: { "application/json": { schema: { $ref: `#/components/schemas/${ref}` } } },
});

export const openapiSpec = {
  openapi: "3.0.3",
  info: {
    title: "Lokkho API",
    version: "1.0.0",
    description:
      "REST API for the **Lokkho** platform — manage exam modules, subjects, topics, " +
      "personal progress, question banks, notes, study planners, mock tests, books, job " +
      "listings, resources and application tracking.\n\n" +
      "### Authentication\n" +
      "Most endpoints require a **JWT access token**. Obtain one from `POST /auth/login` " +
      "or `POST /auth/register`, then send it as `Authorization: Bearer <accessToken>`.\n\n" +
      "A long-lived **refresh token** is set as an httpOnly cookie and rotated via " +
      "`POST /auth/refresh`.\n\n" +
      "### Ownership\n" +
      "Content is per-user. List endpoints return only the caller's records, and " +
      "`PUT`/`DELETE` are restricted to the record's creator.",
    contact: { name: "Lokkho", url: env.clientUrl },
    license: { name: "MIT" },
  },
  servers: [
    { url: "http://localhost:5000/api", description: "Local development" },
    { url: "/api", description: "Current host" },
  ],
  tags: [
    { name: "Auth", description: "Registration, login, tokens, email & password flows" },
    { name: "Account", description: "The logged-in user's own profile & account" },
    { name: "Exam Modules", description: "Community exam modules (BCS, Bank, Railway, …)" },
    { name: "Subjects", description: "Subjects within an exam module" },
    { name: "Topics", description: "Topics within a subject" },
    { name: "Progress", description: "Personal topic & subject progress tracking" },
    { name: "Questions", description: "Previous-year and practice question bank" },
    { name: "Notes", description: "Personal notes" },
    { name: "Study Plans", description: "Day-wise study planner" },
    { name: "Mock Tests", description: "Mock-test attempts & scores" },
    { name: "Books", description: "Recommended books" },
    { name: "Jobs", description: "Government / non-government job listings" },
    { name: "Resources", description: "Documents, processes and tips for job seekers" },
    { name: "Important Topics", description: "High-priority subjects & topics + personal status" },
    { name: "Applications", description: "Job-application tracker (stages, dates, status)" },
    { name: "System", description: "Health & meta" },
  ],

  components: {
    securitySchemes: {
      bearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT",
        description: "JWT access token from `/auth/login` or `/auth/register`.",
      },
    },

    responses: {
      Unauthorized: {
        description: "Missing, invalid or expired access token",
        content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
      },
      Forbidden: {
        description: "Authenticated, but not the owner of the resource",
        content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
      },
      NotFound: {
        description: "Resource not found",
        content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } },
      },
      ValidationError: {
        description: "Request body failed validation",
        content: { "application/json": { schema: { $ref: "#/components/schemas/ValidationErrorResponse" } } },
      },
    },

    schemas: {
      // ---- Generic envelopes ----
      SuccessResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          message: { type: "string", example: "OK" },
        },
      },
      ErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Unauthorized" },
        },
      },
      ValidationErrorResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: false },
          message: { type: "string", example: "Validation failed" },
          details: {
            type: "array",
            items: {
              type: "object",
              properties: {
                field: { type: "string", example: "email" },
                message: { type: "string", example: "Valid email required" },
              },
            },
          },
        },
      },
      Pagination: {
        type: "object",
        properties: {
          count: { type: "integer", example: 10 },
          total: { type: "integer", example: 42 },
          page: { type: "integer", example: 1 },
          limit: { type: "integer", example: 10 },
          totalPages: { type: "integer", example: 5 },
        },
      },
      User: {
        type: "object",
        properties: {
          _id: { type: "string", example: "665f1c2a9b3e4a0012ab34cd" },
          name: { type: "string", example: "Rejoyan Islam" },
          email: { type: "string", format: "email", example: "user@example.com" },
          emailVerified: { type: "boolean", example: false },
          createdAt: { type: "string", format: "date-time" },
          updatedAt: { type: "string", format: "date-time" },
        },
      },
      AuthResponse: {
        type: "object",
        properties: {
          success: { type: "boolean", example: true },
          user: { $ref: "#/components/schemas/User" },
          accessToken: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
        },
      },

      // ---- Auth bodies ----
      RegisterBody: {
        type: "object",
        required: ["name", "email", "password"],
        properties: {
          name: { type: "string", minLength: 2, example: "Rejoyan Islam" },
          email: { type: "string", format: "email", example: "user@example.com" },
          password: { type: "string", minLength: 6, example: "secret123" },
        },
      },
      LoginBody: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", format: "email", example: "demo@lokkho.com" },
          password: { type: "string", example: "demo123" },
        },
      },
      ForgotPasswordBody: {
        type: "object",
        required: ["email"],
        properties: { email: { type: "string", format: "email", example: "user@example.com" } },
      },
      ResetPasswordBody: {
        type: "object",
        required: ["token", "password"],
        properties: {
          token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." },
          password: { type: "string", minLength: 6, example: "newsecret123" },
        },
      },
      VerifyEmailBody: {
        type: "object",
        required: ["token"],
        properties: { token: { type: "string", example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." } },
      },

      // ---- Account bodies ----
      UpdateProfileBody: {
        type: "object",
        required: ["name"],
        properties: { name: { type: "string", minLength: 2, example: "New Name" } },
      },
      ChangePasswordBody: {
        type: "object",
        required: ["currentPassword", "newPassword"],
        properties: {
          currentPassword: { type: "string", example: "secret123" },
          newPassword: { type: "string", minLength: 6, example: "newsecret123" },
        },
      },

      // ---- Domain bodies ----
      ExamModuleBody: {
        type: "object",
        required: ["title"],
        properties: {
          title: { type: "string", minLength: 2, example: "Railway Exam" },
          category: { type: "string", enum: MODULE_CATEGORIES, example: "Railway" },
          description: { type: "string" },
          totalMarks: { type: "number", example: 100 },
          durationMinutes: { type: "number", example: 90 },
          examPattern: {
            type: "array",
            items: {
              type: "object",
              required: ["section"],
              properties: {
                section: { type: "string", example: "General Knowledge" },
                marks: { type: "number", example: 20 },
                questionCount: { type: "number", example: 20 },
              },
            },
          },
          minCgpa: { type: "string", example: "2.50" },
          degree: { type: "string", example: "Bachelor" },
          eligibility: { type: "string" },
        },
      },
      SubjectBody: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", example: "Bangla" },
          marks: { type: "number", example: 30 },
          note: { type: "string" },
          order: { type: "number", example: 1 },
        },
      },
      TopicBody: {
        type: "object",
        required: ["title"],
        properties: {
          title: { type: "string", example: "Sandhi" },
          priority: { type: "string", enum: PRIORITIES, example: "high" },
          difficulty: { type: "string", enum: DIFFICULTIES, example: "medium" },
          order: { type: "number", example: 1 },
        },
      },
      ProgressBody: {
        type: "object",
        properties: {
          status: { type: "string", enum: PROGRESS_STATUSES, example: "in_progress" },
          revisionDate: { type: "string", format: "date-time", nullable: true },
        },
      },
      QuestionBody: {
        type: "object",
        required: ["moduleId", "questionText"],
        properties: {
          moduleId: { type: "string", example: "665f1c2a9b3e4a0012ab34cd" },
          subjectId: { type: "string" },
          topicId: { type: "string" },
          year: { type: "integer", example: 2023 },
          examName: { type: "string", example: "44th BCS" },
          type: { type: "string", enum: QUESTION_TYPES, example: "mcq" },
          questionText: { type: "string", example: "What is the capital of Bangladesh?" },
          options: { type: "array", items: { type: "string" }, example: ["Dhaka", "Chittagong", "Khulna", "Sylhet"] },
          correctAnswer: { type: "string", example: "Dhaka" },
          explanation: { type: "string" },
        },
      },
      NoteBody: {
        type: "object",
        required: ["title"],
        properties: {
          moduleId: { type: "string" },
          subjectId: { type: "string" },
          topicId: { type: "string" },
          title: { type: "string", example: "Important formulas" },
          content: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
        },
      },
      StudyPlanBody: {
        type: "object",
        required: ["date"],
        properties: {
          date: { type: "string", pattern: "^\\d{4}-\\d{2}-\\d{2}$", example: "2026-06-08" },
          items: {
            type: "array",
            items: {
              type: "object",
              properties: {
                topicId: { type: "string" },
                text: { type: "string", example: "Revise Bangla grammar" },
                targetMinutes: { type: "number", example: 60 },
                status: { type: "string", enum: PLAN_ITEM_STATUSES, example: "pending" },
              },
            },
          },
        },
      },
      MockTestBody: {
        type: "object",
        required: ["moduleId"],
        properties: {
          moduleId: { type: "string", example: "665f1c2a9b3e4a0012ab34cd" },
          total: { type: "integer", example: 50 },
          answers: {
            type: "array",
            items: {
              type: "object",
              properties: {
                questionId: { type: "string" },
                selected: { type: "string" },
                correct: { type: "boolean" },
              },
            },
          },
        },
      },
      BookBody: {
        type: "object",
        required: ["title"],
        properties: {
          title: { type: "string", example: "Professor's Job Solution" },
          author: { type: "string" },
          subject: { type: "string" },
          examModuleId: { type: "string" },
          description: { type: "string" },
          coverUrl: { type: "string", format: "uri" },
          buyLink: { type: "string", format: "uri" },
        },
      },
      JobBody: {
        type: "object",
        required: ["title"],
        properties: {
          title: { type: "string", example: "Assistant Director" },
          organization: { type: "string", example: "Bangladesh Bank" },
          category: { type: "string", enum: JOB_CATEGORIES, example: "government" },
          pensionIncluded: { type: "boolean", example: true },
          sector: { type: "string" },
          qualification: { type: "string" },
          ageLimit: { type: "string", example: "21-30" },
          salaryScale: { type: "string", example: "Grade 9" },
          description: { type: "string" },
          applyLink: { type: "string", format: "uri" },
          source: { type: "string" },
          deadline: { type: "string", format: "date-time" },
          tags: { type: "array", items: { type: "string" } },
        },
      },
      ResourceBody: {
        type: "object",
        required: ["title"],
        properties: {
          title: { type: "string", example: "How to fill BCS form" },
          category: { type: "string", enum: RESOURCE_CATEGORIES, example: "process" },
          content: { type: "string" },
          link: { type: "string", format: "uri" },
          tags: { type: "array", items: { type: "string" } },
        },
      },
      ImportantSubjectBody: {
        type: "object",
        required: ["name"],
        properties: {
          name: { type: "string", example: "International Affairs" },
          note: { type: "string" },
        },
      },
      SubjectTopicBody: {
        type: "object",
        required: ["title"],
        properties: {
          title: { type: "string", example: "Recent UN summits" },
          priority: { type: "string", enum: PRIORITIES, example: "high" },
          note: { type: "string" },
        },
      },
      ImportantTopicBody: {
        type: "object",
        properties: {
          title: { type: "string", example: "Current affairs - May" },
          subject: { type: "string" },
          category: { type: "string", enum: MODULE_CATEGORIES },
          priority: { type: "string", enum: PRIORITIES },
          note: { type: "string" },
          tags: { type: "array", items: { type: "string" } },
        },
      },
      ApplicationBody: {
        type: "object",
        required: ["jobName"],
        properties: {
          jobName: { type: "string", example: "44th BCS" },
          organization: { type: "string", example: "BPSC" },
          isApplied: { type: "boolean", example: true },
          appliedDate: { type: "string", nullable: true, example: "2026-05-01" },
          examDate: { type: "string", nullable: true, example: "2026-08-15" },
          stages: {
            type: "array",
            items: {
              type: "object",
              required: ["name"],
              properties: {
                name: { type: "string", example: "Preliminary" },
                status: { type: "string", enum: STAGE_STATUSES, example: "pending" },
              },
            },
          },
          notes: { type: "string" },
          link: { type: "string", format: "uri" },
        },
      },
    },
  },

  // Global default — individual public routes override with `security: []`.
  security: auth,

  paths: {
    // ===================== System =====================
    "/health": {
      get: {
        tags: ["System"],
        summary: "Health check",
        security: [],
        responses: { 200: ok("Service is up") },
      },
    },

    // ===================== Auth =====================
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new user",
        description: "Creates the account, clones a starter dataset, sends a verification email, and returns an access token (refresh token set as cookie).",
        security: [],
        requestBody: jsonBody("RegisterBody"),
        responses: {
          201: { description: "Registered", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } } },
          400: r400,
          409: { description: "Email already registered", content: { "application/json": { schema: { $ref: "#/components/schemas/ErrorResponse" } } } },
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Log in",
        security: [],
        requestBody: jsonBody("LoginBody"),
        responses: {
          200: { description: "Logged in", content: { "application/json": { schema: { $ref: "#/components/schemas/AuthResponse" } } } },
          400: r400,
          401: r401,
        },
      },
    },
    "/auth/refresh": {
      post: {
        tags: ["Auth"],
        summary: "Rotate the session",
        description: "Reads the `refreshToken` httpOnly cookie, validates & rotates it, and returns a new access token.",
        security: [],
        responses: {
          200: { description: "New access token", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, accessToken: { type: "string" } } } } } },
          401: r401,
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Log out",
        description: "Revokes the current refresh token and clears the cookie.",
        security: [],
        responses: { 200: ok("Logged out") },
      },
    },
    "/auth/forgot-password": {
      post: {
        tags: ["Auth"],
        summary: "Request a password reset",
        description: "Always responds with success (no email enumeration). In development the reset link is returned as `devResetLink`.",
        security: [],
        requestBody: jsonBody("ForgotPasswordBody"),
        responses: { 200: ok("If the email exists, a reset link was sent"), 400: r400 },
      },
    },
    "/auth/reset-password": {
      post: {
        tags: ["Auth"],
        summary: "Reset password with a token",
        security: [],
        requestBody: jsonBody("ResetPasswordBody"),
        responses: { 200: ok("Password reset"), 400: r400 },
      },
    },
    "/auth/verify-email": {
      post: {
        tags: ["Auth"],
        summary: "Verify email with a token",
        security: [],
        requestBody: jsonBody("VerifyEmailBody"),
        responses: { 200: ok("Email verified"), 400: r400 },
      },
    },
    "/auth/resend-verification": {
      post: {
        tags: ["Auth"],
        summary: "Resend the verification email",
        security: auth,
        responses: { 200: ok("Verification email sent"), 401: r401 },
      },
    },

    // ===================== Account =====================
    "/auth/me": {
      get: {
        tags: ["Account"],
        summary: "Get the current user",
        responses: {
          200: { description: "Current user", content: { "application/json": { schema: { type: "object", properties: { success: { type: "boolean" }, user: { $ref: "#/components/schemas/User" } } } } } },
          401: r401,
        },
      },
    },
    "/auth/profile": {
      put: {
        tags: ["Account"],
        summary: "Update display name",
        requestBody: jsonBody("UpdateProfileBody"),
        responses: { 200: ok("Profile updated"), 400: r400, 401: r401 },
      },
    },
    "/auth/password": {
      put: {
        tags: ["Account"],
        summary: "Change password",
        description: "Verifies the current password, sets the new one and rotates the session.",
        requestBody: jsonBody("ChangePasswordBody"),
        responses: { 200: ok("Password changed"), 400: r400, 401: r401 },
      },
    },
    "/auth/account": {
      delete: {
        tags: ["Account"],
        summary: "Delete account",
        description: "Deletes the user and all of their personal data.",
        responses: { 200: ok("Account deleted"), 401: r401 },
      },
    },

    // ===================== Exam Modules =====================
    "/modules": {
      get: { tags: ["Exam Modules"], summary: "List the caller's exam modules", responses: { 200: ok(), 401: r401 } },
      post: { tags: ["Exam Modules"], summary: "Create an exam module", requestBody: jsonBody("ExamModuleBody"), responses: { 201: ok("Created"), 400: r400, 401: r401 } },
    },
    "/modules/{id}": {
      get: { tags: ["Exam Modules"], summary: "Get one exam module (owner only)", parameters: [idParam()], responses: { 200: ok(), 401: r401, 404: r404 } },
      put: { tags: ["Exam Modules"], summary: "Update an exam module (owner only)", parameters: [idParam()], requestBody: jsonBody("ExamModuleBody"), responses: { 200: ok(), 400: r400, 401: r401, 403: r403, 404: r404 } },
      delete: { tags: ["Exam Modules"], summary: "Delete an exam module (owner only)", parameters: [idParam()], responses: { 200: ok("Deleted"), 401: r401, 403: r403, 404: r404 } },
    },

    // ===================== Subjects =====================
    "/modules/{id}/subjects": {
      get: { tags: ["Subjects"], summary: "List subjects of a module (owner only)", parameters: [idParam("id", "Exam module id")], responses: { 200: ok(), 401: r401, 404: r404 } },
      post: { tags: ["Subjects"], summary: "Add a subject to a module", parameters: [idParam("id", "Exam module id")], requestBody: jsonBody("SubjectBody"), responses: { 201: ok("Created"), 400: r400, 401: r401 } },
    },
    "/subjects/{id}": {
      put: { tags: ["Subjects"], summary: "Update a subject (owner only)", parameters: [idParam()], requestBody: jsonBody("SubjectBody"), responses: { 200: ok(), 400: r400, 401: r401, 403: r403, 404: r404 } },
      delete: { tags: ["Subjects"], summary: "Delete a subject (owner only)", parameters: [idParam()], responses: { 200: ok("Deleted"), 401: r401, 403: r403, 404: r404 } },
    },

    // ===================== Topics =====================
    "/subjects/{id}/topics": {
      get: { tags: ["Topics"], summary: "List topics of a subject (owner only)", parameters: [idParam("id", "Subject id")], responses: { 200: ok(), 401: r401, 404: r404 } },
      post: { tags: ["Topics"], summary: "Add a topic to a subject", parameters: [idParam("id", "Subject id")], requestBody: jsonBody("TopicBody"), responses: { 201: ok("Created"), 400: r400, 401: r401 } },
    },
    "/topics/{id}": {
      get: { tags: ["Topics"], summary: "Get one topic (owner only)", parameters: [idParam()], responses: { 200: ok(), 401: r401, 404: r404 } },
      put: { tags: ["Topics"], summary: "Update a topic (owner only)", parameters: [idParam()], requestBody: jsonBody("TopicBody"), responses: { 200: ok(), 400: r400, 401: r401, 403: r403, 404: r404 } },
      delete: { tags: ["Topics"], summary: "Delete a topic (owner only)", parameters: [idParam()], responses: { 200: ok("Deleted"), 401: r401, 403: r403, 404: r404 } },
    },

    // ===================== Progress =====================
    "/progress": {
      get: { tags: ["Progress"], summary: "List the caller's topic progress", responses: { 200: ok(), 401: r401 } },
    },
    "/progress/analytics": {
      get: { tags: ["Progress"], summary: "Aggregated progress analytics", responses: { 200: ok(), 401: r401 } },
    },
    "/progress/{topicId}": {
      put: { tags: ["Progress"], summary: "Upsert progress for a topic", parameters: [idParam("topicId", "Topic id")], requestBody: jsonBody("ProgressBody"), responses: { 200: ok(), 400: r400, 401: r401 } },
    },
    "/subject-progress": {
      get: { tags: ["Progress"], summary: "List the caller's subject progress", responses: { 200: ok(), 401: r401 } },
    },
    "/subject-progress/{subjectId}": {
      put: { tags: ["Progress"], summary: "Upsert progress for a subject", parameters: [idParam("subjectId", "Subject id")], requestBody: jsonBody("ProgressBody"), responses: { 200: ok(), 400: r400, 401: r401 } },
    },

    // ===================== Questions =====================
    "/questions": {
      get: {
        tags: ["Questions"],
        summary: "List questions",
        parameters: [
          { name: "moduleId", in: "query", schema: { type: "string" }, description: "Filter by exam module" },
          { name: "subjectId", in: "query", schema: { type: "string" } },
          { name: "topicId", in: "query", schema: { type: "string" } },
          { name: "year", in: "query", schema: { type: "integer" } },
          { name: "type", in: "query", schema: { type: "string", enum: QUESTION_TYPES } },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10, maximum: 100 } },
        ],
        responses: { 200: ok(), 401: r401 },
      },
      post: { tags: ["Questions"], summary: "Create a question", requestBody: jsonBody("QuestionBody"), responses: { 201: ok("Created"), 400: r400, 401: r401 } },
    },
    "/questions/{id}": {
      put: { tags: ["Questions"], summary: "Update a question (owner only)", parameters: [idParam()], requestBody: jsonBody("QuestionBody"), responses: { 200: ok(), 400: r400, 401: r401, 403: r403, 404: r404 } },
      delete: { tags: ["Questions"], summary: "Delete a question (owner only)", parameters: [idParam()], responses: { 200: ok("Deleted"), 401: r401, 403: r403, 404: r404 } },
    },

    // ===================== Notes =====================
    "/notes": {
      get: { tags: ["Notes"], summary: "List the caller's notes", responses: { 200: ok(), 401: r401 } },
      post: { tags: ["Notes"], summary: "Create a note", requestBody: jsonBody("NoteBody"), responses: { 201: ok("Created"), 400: r400, 401: r401 } },
    },
    "/notes/{id}": {
      put: { tags: ["Notes"], summary: "Update a note (owner only)", parameters: [idParam()], requestBody: jsonBody("NoteBody"), responses: { 200: ok(), 400: r400, 401: r401, 403: r403, 404: r404 } },
      delete: { tags: ["Notes"], summary: "Delete a note (owner only)", parameters: [idParam()], responses: { 200: ok("Deleted"), 401: r401, 403: r403, 404: r404 } },
    },

    // ===================== Study Plans =====================
    "/study-plans": {
      get: {
        tags: ["Study Plans"],
        summary: "List study plans",
        parameters: [{ name: "date", in: "query", schema: { type: "string", example: "2026-06-08" }, description: "Filter by YYYY-MM-DD" }],
        responses: { 200: ok(), 401: r401 },
      },
      post: { tags: ["Study Plans"], summary: "Create or update a day's plan (upsert by date)", requestBody: jsonBody("StudyPlanBody"), responses: { 200: ok("Upserted"), 400: r400, 401: r401 } },
    },
    "/study-plans/{id}": {
      delete: { tags: ["Study Plans"], summary: "Delete a study plan (owner only)", parameters: [idParam()], responses: { 200: ok("Deleted"), 401: r401, 403: r403, 404: r404 } },
    },

    // ===================== Mock Tests =====================
    "/mock-tests": {
      get: { tags: ["Mock Tests"], summary: "List the caller's mock-test attempts", responses: { 200: ok(), 401: r401 } },
      post: { tags: ["Mock Tests"], summary: "Record a mock-test attempt", requestBody: jsonBody("MockTestBody"), responses: { 201: ok("Created"), 400: r400, 401: r401 } },
    },

    // ===================== Books =====================
    "/books": {
      get: { tags: ["Books"], summary: "List the caller's books", responses: { 200: ok(), 401: r401 } },
      post: { tags: ["Books"], summary: "Add a book", requestBody: jsonBody("BookBody"), responses: { 201: ok("Created"), 400: r400, 401: r401 } },
    },
    "/books/{id}": {
      put: { tags: ["Books"], summary: "Update a book (owner only)", parameters: [idParam()], requestBody: jsonBody("BookBody"), responses: { 200: ok(), 400: r400, 401: r401, 403: r403, 404: r404 } },
      delete: { tags: ["Books"], summary: "Delete a book (owner only)", parameters: [idParam()], responses: { 200: ok("Deleted"), 401: r401, 403: r403, 404: r404 } },
    },

    // ===================== Jobs =====================
    "/jobs": {
      get: {
        tags: ["Jobs"],
        summary: "List jobs",
        parameters: [
          { name: "category", in: "query", schema: { type: "string", enum: JOB_CATEGORIES } },
          { name: "pension", in: "query", schema: { type: "string", enum: ["true", "false"] }, description: "Filter by pension-included" },
          { name: "search", in: "query", schema: { type: "string" }, description: "Search title / organization / sector" },
          { name: "page", in: "query", schema: { type: "integer", default: 1 } },
          { name: "limit", in: "query", schema: { type: "integer", default: 10, maximum: 100 } },
        ],
        responses: { 200: ok(), 401: r401 },
      },
      post: { tags: ["Jobs"], summary: "Create a job listing", requestBody: jsonBody("JobBody"), responses: { 201: ok("Created"), 400: r400, 401: r401 } },
    },
    "/jobs/{id}": {
      get: { tags: ["Jobs"], summary: "Get one job (owner only)", parameters: [idParam()], responses: { 200: ok(), 401: r401, 404: r404 } },
      put: { tags: ["Jobs"], summary: "Update a job (owner only)", parameters: [idParam()], requestBody: jsonBody("JobBody"), responses: { 200: ok(), 400: r400, 401: r401, 403: r403, 404: r404 } },
      delete: { tags: ["Jobs"], summary: "Delete a job (owner only)", parameters: [idParam()], responses: { 200: ok("Deleted"), 401: r401, 403: r403, 404: r404 } },
    },

    // ===================== Resources =====================
    "/resources": {
      get: { tags: ["Resources"], summary: "List the caller's resources", responses: { 200: ok(), 401: r401 } },
      post: { tags: ["Resources"], summary: "Create a resource", requestBody: jsonBody("ResourceBody"), responses: { 201: ok("Created"), 400: r400, 401: r401 } },
    },
    "/resources/{id}": {
      put: { tags: ["Resources"], summary: "Update a resource (owner only)", parameters: [idParam()], requestBody: jsonBody("ResourceBody"), responses: { 200: ok(), 400: r400, 401: r401, 403: r403, 404: r404 } },
      delete: { tags: ["Resources"], summary: "Delete a resource (owner only)", parameters: [idParam()], responses: { 200: ok("Deleted"), 401: r401, 403: r403, 404: r404 } },
    },

    // ===================== Important Topics =====================
    "/important-subjects": {
      get: { tags: ["Important Topics"], summary: "List important subjects", responses: { 200: ok(), 401: r401 } },
      post: { tags: ["Important Topics"], summary: "Create an important subject", requestBody: jsonBody("ImportantSubjectBody"), responses: { 201: ok("Created"), 400: r400, 401: r401 } },
    },
    "/important-subjects/{id}": {
      get: { tags: ["Important Topics"], summary: "Get one important subject (owner only)", parameters: [idParam()], responses: { 200: ok(), 401: r401, 404: r404 } },
      put: { tags: ["Important Topics"], summary: "Update an important subject (owner only)", parameters: [idParam()], requestBody: jsonBody("ImportantSubjectBody"), responses: { 200: ok(), 400: r400, 401: r401, 403: r403, 404: r404 } },
      delete: { tags: ["Important Topics"], summary: "Delete an important subject (owner only)", parameters: [idParam()], responses: { 200: ok("Deleted"), 401: r401, 403: r403, 404: r404 } },
    },
    "/important-subjects/{id}/topics": {
      get: { tags: ["Important Topics"], summary: "List topics under an important subject (owner only)", parameters: [idParam("id", "Important subject id")], responses: { 200: ok(), 401: r401, 404: r404 } },
      post: { tags: ["Important Topics"], summary: "Add a topic under an important subject", parameters: [idParam("id", "Important subject id")], requestBody: jsonBody("SubjectTopicBody"), responses: { 201: ok("Created"), 400: r400, 401: r401 } },
    },
    "/important-progress": {
      get: { tags: ["Important Topics"], summary: "List personal status on important topics", responses: { 200: ok(), 401: r401 } },
    },
    "/important-progress/{topicId}": {
      put: { tags: ["Important Topics"], summary: "Upsert personal status for an important topic", parameters: [idParam("topicId", "Important topic id")], requestBody: jsonBody("ProgressBody"), responses: { 200: ok(), 400: r400, 401: r401 } },
    },
    "/important-topics": {
      get: { tags: ["Important Topics"], summary: "List important topics (flat / legacy)", responses: { 200: ok(), 401: r401 } },
    },
    "/important-topics/{id}": {
      put: { tags: ["Important Topics"], summary: "Update an important topic (owner only)", parameters: [idParam()], requestBody: jsonBody("ImportantTopicBody"), responses: { 200: ok(), 400: r400, 401: r401, 403: r403, 404: r404 } },
      delete: { tags: ["Important Topics"], summary: "Delete an important topic (owner only)", parameters: [idParam()], responses: { 200: ok("Deleted"), 401: r401, 403: r403, 404: r404 } },
    },

    // ===================== Applications =====================
    "/applications": {
      get: { tags: ["Applications"], summary: "List the caller's applications", responses: { 200: ok(), 401: r401 } },
      post: { tags: ["Applications"], summary: "Create an application", requestBody: jsonBody("ApplicationBody"), responses: { 201: ok("Created"), 400: r400, 401: r401 } },
    },
    "/applications/{id}": {
      put: { tags: ["Applications"], summary: "Update an application (owner only)", parameters: [idParam()], requestBody: jsonBody("ApplicationBody"), responses: { 200: ok(), 400: r400, 401: r401, 403: r403, 404: r404 } },
      delete: { tags: ["Applications"], summary: "Delete an application (owner only)", parameters: [idParam()], responses: { 200: ok("Deleted"), 401: r401, 403: r403, 404: r404 } },
    },
  },
} as const;

export default openapiSpec;
