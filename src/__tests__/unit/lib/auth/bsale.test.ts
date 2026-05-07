import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  getClientByRut,
  extractClubWilierNumber,
  isClientActive,
  getMembershipName,
  type BSaleClient,
} from "@/lib/auth/bsale";

const makeClient = (overrides: Partial<BSaleClient> = {}): BSaleClient => ({
  id: 1,
  firstName: "Ana",
  lastName: "González",
  email: "ana@test.com",
  code: "12345678k",
  phone: "",
  company: "",
  state: 0,
  activity: "",
  hasCredit: 0,
  maxCredit: 0,
  points: 0,
  ...overrides,
});

describe("getClientByRut", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns the first client on a successful response", async () => {
    const client = makeClient();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ count: 1, items: [client] }),
      }),
    );

    const result = await getClientByRut("12345678k");
    expect(result).toEqual(client);
  });

  it("returns null when count is 0", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ count: 0, items: [] }),
      }),
    );

    const result = await getClientByRut("00000000-0");
    expect(result).toBeNull();
  });

  it("throws when the API returns a non-ok status", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({ ok: false, status: 401 }),
    );

    await expect(getClientByRut("12345678k")).rejects.toThrow(
      "BSale API error: 401",
    );
  });

  it("propagates network errors", async () => {
    vi.stubGlobal(
      "fetch",
      vi.fn().mockRejectedValue(new Error("Network failure")),
    );

    await expect(getClientByRut("12345678k")).rejects.toThrow(
      "Network failure",
    );
  });
});

describe("extractClubWilierNumber", () => {
  it("returns the client id as string when Club Wilier attribute exists", () => {
    const client = makeClient({
      id: 42,
      attributes: {
        items: [{ id: 1, name: "Club Wilier", value: "yes", type: 1, href: "" }],
      },
    });
    expect(extractClubWilierNumber(client)).toBe("42");
  });

  it("returns null when Club Wilier attribute is absent", () => {
    const client = makeClient({
      attributes: {
        items: [{ id: 2, name: "Otro atributo", value: "x", type: 1, href: "" }],
      },
    });
    expect(extractClubWilierNumber(client)).toBeNull();
  });

  it("returns null when attributes are undefined", () => {
    const client = makeClient({ attributes: undefined });
    expect(extractClubWilierNumber(client)).toBeNull();
  });
});

describe("isClientActive", () => {
  it("returns true when state is 0", () => {
    expect(isClientActive(makeClient({ state: 0 }))).toBe(true);
  });

  it("returns false when state is non-zero", () => {
    expect(isClientActive(makeClient({ state: 1 }))).toBe(false);
    expect(isClientActive(makeClient({ state: 2 }))).toBe(false);
  });
});

describe("getMembershipName", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("returns clientId and membershipName when the attribute is found", async () => {
    const client = makeClient({
      id: 10,
      attributes: {
        items: [
          {
            id: 29,
            name: "Membresía",
            value: "5",
            type: 1,
            href: "https://api.bsale.io/v1/attributes/29.json",
          },
        ],
      },
    });

    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ count: 1, items: [client] }),
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            details: {
              items: [{ id: 5, name: "Premium", value: "5" }],
            },
          }),
        }),
    );

    const result = await getMembershipName(client);
    expect(result).toEqual({ clientId: "10", membershipName: "Premium" });
  });

  it("returns nulls when the client has no attributes", async () => {
    const client = makeClient({ attributes: undefined });

    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ count: 1, items: [client] }),
      }),
    );

    const result = await getMembershipName(client);
    expect(result).toEqual({ clientId: null, membershipName: null });
  });

  it("throws when the attribute detail fetch fails", async () => {
    const client = makeClient({
      attributes: {
        items: [
          {
            id: 29,
            name: "Membresía",
            value: "5",
            type: 1,
            href: "https://api.bsale.io/v1/attributes/29.json",
          },
        ],
      },
    });

    vi.stubGlobal(
      "fetch",
      vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({ count: 1, items: [client] }),
        })
        .mockResolvedValueOnce({ ok: false, status: 500 }),
    );

    await expect(getMembershipName(client)).rejects.toThrow(
      "Error obteniendo attributo",
    );
  });
});
