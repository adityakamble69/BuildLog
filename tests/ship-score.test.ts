import { test, describe } from "node:test";
import assert from "node:assert/strict";

import {
  calculateShipScore,
  getShipScoreStatus,
  shipScoreInputFromCollections,
} from "../lib/utils/ship-score";

describe("calculateShipScore", () => {
  test("brand new project scores 0 and is flagged as new", () => {
    const result = calculateShipScore({
      totalTasks: 0,
      completedTasks: 0,
      lastActivityAt: null,
      devLogCount: 0,
    });

    assert.equal(result.score, 0);
    assert.equal(result.isNewProject, true);
    assert.equal(result.factors.length, 3);
  });

  test("fully complete, active, documented project scores 100", () => {
    const result = calculateShipScore({
      totalTasks: 10,
      completedTasks: 10,
      lastActivityAt: new Date(), // today
      devLogCount: 10,
    });

    assert.equal(result.score, 100);
    assert.equal(result.isNewProject, false);
  });

  test("task completion factor rounds to the nearest point", () => {
    const result = calculateShipScore({
      totalTasks: 3,
      completedTasks: 1, // 33.3% of 50 = 16.65 -> rounds to 17
      lastActivityAt: null,
      devLogCount: 0,
    });

    const taskFactor = result.factors.find((f) => f.label === "Task completion");
    assert.equal(taskFactor?.points, 17);
  });

  test("recent activity decays with staleness", () => {
    const dayInMs = 1000 * 60 * 60 * 24;
    const scoreAt = (daysAgo: number) =>
      calculateShipScore({
        totalTasks: 0,
        completedTasks: 0,
        lastActivityAt: new Date(Date.now() - daysAgo * dayInMs),
        devLogCount: 0,
      }).factors.find((f) => f.label === "Recent activity")?.points;

    assert.equal(scoreAt(0), 30);
    assert.equal(scoreAt(2), 24);
    assert.equal(scoreAt(5), 18);
    assert.equal(scoreAt(10), 10);
    assert.equal(scoreAt(20), 4);
    assert.equal(scoreAt(31), 0);
  });

  test("documentation factor has diminishing tiers", () => {
    const docsScore = (n: number) =>
      calculateShipScore({
        totalTasks: 0,
        completedTasks: 0,
        lastActivityAt: null,
        devLogCount: n,
      }).factors.find((f) => f.label === "Documentation")?.points;

    assert.equal(docsScore(0), 0);
    assert.equal(docsScore(1), 8);
    assert.equal(docsScore(5), 14);
    assert.equal(docsScore(6), 20);
  });

  test("division by zero is guarded for task completion with no tasks", () => {
    const result = calculateShipScore({
      totalTasks: 0,
      completedTasks: 0,
      lastActivityAt: new Date(),
      devLogCount: 0,
    });
    const taskFactor = result.factors.find((f) => f.label === "Task completion");
    assert.equal(taskFactor?.points, 0);
    assert.equal(Number.isNaN(taskFactor?.points), false);
  });

  test("isNewProject is false as soon as any single signal is present", () => {
    const withTaskOnly = calculateShipScore({
      totalTasks: 1,
      completedTasks: 0,
      lastActivityAt: null,
      devLogCount: 0,
    });
    assert.equal(withTaskOnly.isNewProject, false);
  });
});

describe("getShipScoreStatus", () => {
  test("new project always reports 'Just started' regardless of score", () => {
    const status = getShipScoreStatus({
      score: 0,
      factors: [],
      isNewProject: true,
    });
    assert.equal(status.label, "Just started");
    assert.equal(status.variant, "info");
  });

  test("boundary at 70 is inclusive (>=70 is On track)", () => {
    const status = getShipScoreStatus({ score: 70, factors: [], isNewProject: false });
    assert.equal(status.label, "On track");
    assert.equal(status.variant, "success");
  });

  test("boundary at 69 falls into Needs attention", () => {
    const status = getShipScoreStatus({ score: 69, factors: [], isNewProject: false });
    assert.equal(status.label, "Needs attention");
    assert.equal(status.variant, "warning");
  });

  test("boundary at 40 is inclusive (>=40 is Needs attention)", () => {
    const status = getShipScoreStatus({ score: 40, factors: [], isNewProject: false });
    assert.equal(status.label, "Needs attention");
  });

  test("below 40 is At risk", () => {
    const status = getShipScoreStatus({ score: 39, factors: [], isNewProject: false });
    assert.equal(status.label, "At risk");
    assert.equal(status.variant, "destructive");
  });
});

describe("shipScoreInputFromCollections", () => {
  test("derives counts and the newest activity timestamp from in-memory arrays", () => {
    const newest = new Date("2026-01-01T00:00:00Z");
    const older = new Date("2025-01-01T00:00:00Z");

    const input = shipScoreInputFromCollections({
      tasks: [{ status: "done" }, { status: "todo" }, { status: "done" }],
      activity: [{ createdAt: newest }, { createdAt: older }],
      devLogs: [{}, {}],
    });

    assert.equal(input.totalTasks, 3);
    assert.equal(input.completedTasks, 2);
    assert.equal(input.lastActivityAt, newest);
    assert.equal(input.devLogCount, 2);
  });

  test("handles empty collections without throwing", () => {
    const input = shipScoreInputFromCollections({
      tasks: [],
      activity: [],
      devLogs: [],
    });

    assert.equal(input.totalTasks, 0);
    assert.equal(input.completedTasks, 0);
    assert.equal(input.lastActivityAt, null);
    assert.equal(input.devLogCount, 0);
  });
});
