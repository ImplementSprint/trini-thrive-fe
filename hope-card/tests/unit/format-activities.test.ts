import { formatActivities } from "../../src/admin-lib/format-activities";

describe("formatActivities", () => {
  const fakeNow = new Date("2026-05-23T12:00:00.000Z").getTime();

  beforeEach(() => {
    jest.spyOn(Date, "now").mockReturnValue(fakeNow);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns an empty array for empty input", () => {
    expect(formatActivities([])).toEqual([]);
  });

  it("maps APPROVED action to type approval and status Approved", () => {
    const raw = [
      {
        id: "1",
        action: "APPROVED",
        description: "Approved John",
        created_at: new Date(fakeNow - 30 * 60 * 1000).toISOString(),
      },
    ];
    const result = formatActivities(raw);
    expect(result[0].type).toBe("approval");
    expect(result[0].status).toBe("Approved");
    expect(result[0].time).toBe("30 minutes ago");
  });

  it("maps REJECTED action to type rejection and status Rejected", () => {
    const raw = [
      {
        id: "2",
        action: "REJECTED",
        description: "Rejected Jane Smith",
        created_at: new Date(fakeNow - 2 * 3600 * 1000).toISOString(),
      },
    ];
    const result = formatActivities(raw);
    expect(result[0].type).toBe("rejection");
    expect(result[0].status).toBe("Rejected");
    expect(result[0].time).toBe("2 hours ago");
  });

  it("maps SENT action to type donation and status Sent", () => {
    const raw = [
      {
        id: "3",
        action: "SENT",
        description: "Sent donation",
        created_at: new Date(fakeNow - 3 * 86400 * 1000).toISOString(),
      },
    ];
    const result = formatActivities(raw);
    expect(result[0].type).toBe("donation");
    expect(result[0].status).toBe("Sent");
    expect(result[0].time).toBe("3 days ago");
  });

  it("maps APPLIED action to type approval and status Applied", () => {
    const raw = [
      {
        id: "4",
        action: "APPLIED",
        description: "Applied for task",
        created_at: new Date(fakeNow - 45 * 1000).toISOString(),
      },
    ];
    const result = formatActivities(raw);
    expect(result[0].type).toBe("approval");
    expect(result[0].status).toBe("Applied");
    expect(result[0].time).toBe("just now");
  });

  it("splits description into action and subject correctly", () => {
    const raw = [
      {
        id: "5",
        action: "APPROVED",
        description: "Approved John Doe",
        created_at: new Date(fakeNow).toISOString(),
      },
    ];
    const result = formatActivities(raw);
    expect(result[0].action).toBe("Approved John");
    expect(result[0].subject).toBe("Doe");
  });

  it("uses a fallback id when id is missing", () => {
    const raw = [
      {
        action: "APPROVED",
        description: "Approved someone",
        created_at: new Date(fakeNow).toISOString(),
      },
    ];
    const result = formatActivities(raw);
    expect(typeof result[0].id).toBe("string");
    expect(result[0].id.length).toBeGreaterThan(0);
  });
});
