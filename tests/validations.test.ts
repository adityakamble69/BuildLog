import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  createProjectSchema,
  updateProjectSchema,
  projectIdSchema,
} from "../lib/validations/projects";
import { createTaskSchema, updateTaskStatusSchema } from "../lib/validations/tasks";
import { createDevLogSchema } from "../lib/validations/dev-logs";
import { uuidSchema, nonEmptyString } from "../lib/validations/common";
import { learningSummaryResultSchema } from "../lib/validations/ai";

const VALID_UUID = "123e4567-e89b-12d3-a456-426614174000";

describe("common validation primitives", () => {
  test("uuidSchema rejects non-UUID strings (prevents ID-based tampering)", () => {
    assert.equal(uuidSchema.safeParse("not-a-uuid").success, false);
    assert.equal(uuidSchema.safeParse("1234").success, false);
    assert.equal(uuidSchema.safeParse(VALID_UUID).success, true);
  });

  test("nonEmptyString rejects empty/whitespace-only input", () => {
    const schema = nonEmptyString(10);
    assert.equal(schema.safeParse("").success, false);
    assert.equal(schema.safeParse("   ").success, false);
    assert.equal(schema.safeParse("hi").success, true);
  });

  test("nonEmptyString enforces max length", () => {
    const schema = nonEmptyString(5);
    assert.equal(schema.safeParse("123456").success, false);
    assert.equal(schema.safeParse("12345").success, true);
  });
});

describe("createProjectSchema", () => {
  test("rejects a missing name", () => {
    const result = createProjectSchema.safeParse({ description: "no name" });
    assert.equal(result.success, false);
  });

  test("rejects a name over 120 chars", () => {
    const result = createProjectSchema.safeParse({ name: "a".repeat(121) });
    assert.equal(result.success, false);
  });

  test("rejects an invalid status enum value (guards against tampered form data)", () => {
    const result = createProjectSchema.safeParse({
      name: "Valid name",
      status: "shipped_to_the_moon",
    });
    assert.equal(result.success, false);
  });

  test("defaults status to active when omitted", () => {
    const result = createProjectSchema.safeParse({ name: "Valid name" });
    assert.equal(result.success, true);
    if (result.success) assert.equal(result.data.status, "active");
  });

  test("dedupes, lowercases, and trims tags, dropping empties", () => {
    const result = createProjectSchema.safeParse({
      name: "Valid name",
      tags: [" Frontend ", "frontend", "", "  "],
    });
    assert.equal(result.success, true);
    if (result.success) assert.deepEqual(result.data.tags, ["frontend"]);
  });

  test("rejects more than 6 tags", () => {
    const result = createProjectSchema.safeParse({
      name: "Valid name",
      tags: ["a", "b", "c", "d", "e", "f", "g"],
    });
    assert.equal(result.success, false);
  });

  test("empty-string description is treated as absent, not stored as ''", () => {
    const result = createProjectSchema.safeParse({
      name: "Valid name",
      description: "",
    });
    assert.equal(result.success, true);
    if (result.success) assert.equal(result.data.description, undefined);
  });
});

describe("updateProjectSchema / projectIdSchema", () => {
  test("update requires a valid id in addition to create fields", () => {
    const withoutId = updateProjectSchema.safeParse({ name: "Valid name" });
    assert.equal(withoutId.success, false);

    const withBadId = updateProjectSchema.safeParse({ name: "Valid name", id: "abc" });
    assert.equal(withBadId.success, false);

    const valid = updateProjectSchema.safeParse({ name: "Valid name", id: VALID_UUID });
    assert.equal(valid.success, true);
  });

  test("projectIdSchema rejects a non-UUID id (e.g. a guessed sequential id)", () => {
    assert.equal(projectIdSchema.safeParse({ id: "1" }).success, false);
    assert.equal(projectIdSchema.safeParse({ id: VALID_UUID }).success, true);
  });
});

describe("createTaskSchema", () => {
  test("requires a valid projectId (UUID) and title", () => {
    const missingProject = createTaskSchema.safeParse({ title: "Do a thing" });
    assert.equal(missingProject.success, false);

    const badProject = createTaskSchema.safeParse({
      projectId: "not-a-uuid",
      title: "Do a thing",
    });
    assert.equal(badProject.success, false);

    const ok = createTaskSchema.safeParse({ projectId: VALID_UUID, title: "Do a thing" });
    assert.equal(ok.success, true);
  });

  test("rejects an invalid due date string", () => {
    const result = createTaskSchema.safeParse({
      projectId: VALID_UUID,
      title: "Do a thing",
      dueDate: "not-a-date",
    });
    assert.equal(result.success, false);
  });

  test("accepts a well-formed ISO due date", () => {
    const result = createTaskSchema.safeParse({
      projectId: VALID_UUID,
      title: "Do a thing",
      dueDate: "2026-12-31",
    });
    assert.equal(result.success, true);
  });

  test("empty-string due date normalizes to undefined (form left blank)", () => {
    const result = createTaskSchema.safeParse({
      projectId: VALID_UUID,
      title: "Do a thing",
      dueDate: "",
    });
    assert.equal(result.success, true);
    if (result.success) assert.equal(result.data.dueDate, undefined);
  });

  test("empty-string task description normalizes to undefined, not ''", () => {
    const result = createTaskSchema.safeParse({
      projectId: VALID_UUID,
      title: "Do a thing",
      description: "",
    });
    assert.equal(result.success, true);
    if (result.success) assert.equal(result.data.description, undefined);
  });

  test("defaults status to todo and priority to medium", () => {
    const result = createTaskSchema.safeParse({ projectId: VALID_UUID, title: "T" });
    assert.equal(result.success, true);
    if (result.success) {
      assert.equal(result.data.status, "todo");
      assert.equal(result.data.priority, "medium");
    }
  });

  test("rejects an out-of-enum status/priority (tampered client payload)", () => {
    const badStatus = createTaskSchema.safeParse({
      projectId: VALID_UUID,
      title: "T",
      status: "on_fire",
    });
    assert.equal(badStatus.success, false);
  });
});

describe("updateTaskStatusSchema", () => {
  test("requires both a valid id and a valid status", () => {
    assert.equal(
      updateTaskStatusSchema.safeParse({ id: VALID_UUID, status: "done" }).success,
      true
    );
    assert.equal(
      updateTaskStatusSchema.safeParse({ id: VALID_UUID, status: "nonsense" }).success,
      false
    );
    assert.equal(
      updateTaskStatusSchema.safeParse({ id: "not-a-uuid", status: "done" }).success,
      false
    );
  });
});

describe("createDevLogSchema", () => {
  test("rejects empty content", () => {
    const result = createDevLogSchema.safeParse({ projectId: VALID_UUID, content: "" });
    assert.equal(result.success, false);
  });

  test("rejects content over 4000 chars", () => {
    const result = createDevLogSchema.safeParse({
      projectId: VALID_UUID,
      content: "a".repeat(4001),
    });
    assert.equal(result.success, false);
  });

  test("accepts reasonable content", () => {
    const result = createDevLogSchema.safeParse({
      projectId: VALID_UUID,
      content: "Fixed the auth bug today.",
    });
    assert.equal(result.success, true);
  });
});

describe("learningSummaryResultSchema", () => {
  test("accepts a well-formed learning summary payload", () => {
    const valid = {
      overview: "Successfully rebuilt the authentication layer using Clerk and Next.js 16.",
      keyLearnings: ["Next.js 16 uses proxy.ts instead of middleware.ts."],
      decisions: ["Chose Drizzle ORM over Prisma for lightweight SQL queries."],
      patternsAndTips: ["Always validate inputs with Zod at server action boundaries."],
    };
    const result = learningSummaryResultSchema.safeParse(valid);
    assert.equal(result.success, true);
  });

  test("rejects missing overview or oversized arrays", () => {
    const invalid = {
      overview: "",
      keyLearnings: Array(10).fill("Learning item"),
      decisions: [],
      patternsAndTips: [],
    };
    const result = learningSummaryResultSchema.safeParse(invalid);
    assert.equal(result.success, false);
  });
});
