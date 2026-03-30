import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "@/proxy";
import { createToken } from "@/lib/auth/jwt";

function makeRequest(path: string, cookie?: string): NextRequest {
  const url = `http://localhost${path}`;
  const headers = new Headers();
  if (cookie) headers.set("cookie", `session=${cookie}`);
  return new NextRequest(url, { headers });
}

describe("proxy middleware", () => {
  describe("root path /", () => {
    it("redirects to /login", async () => {
      const res = await proxy(makeRequest("/"));
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/login");
    });
  });

  describe("public routes", () => {
    it("allows /login through", async () => {
      const res = await proxy(makeRequest("/login"));
      expect(res.status).toBe(200);
    });

    it("allows /api/auth/* through", async () => {
      const res = await proxy(makeRequest("/api/auth/request-otp"));
      expect(res.status).toBe(200);
    });
  });

  describe("/login with an existing valid session", () => {
    it("redirects to /card", async () => {
      const token = await createToken({
        rut: "12345678k",
        email: "test@test.com",
      });
      const res = await proxy(makeRequest("/login", token));
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/card");
    });

    it("clears the cookie and proceeds when token is invalid", async () => {
      const res = await proxy(makeRequest("/login", "bad.token.here"));
      expect(res.status).toBe(200);
      const setCookie = res.headers.get("set-cookie") ?? "";
      expect(setCookie).toContain("session=;");
    });
  });

  describe("protected route /card", () => {
    it("redirects to /login when no session cookie", async () => {
      const res = await proxy(makeRequest("/card"));
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/login");
    });

    it("allows through with a valid session", async () => {
      const token = await createToken({
        rut: "12345678k",
        email: "test@test.com",
      });
      const res = await proxy(makeRequest("/card", token));
      expect(res.status).toBe(200);
    });

    it("redirects and clears cookie with an invalid token", async () => {
      const res = await proxy(makeRequest("/card", "invalid.token"));
      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toContain("/login");
      const setCookie = res.headers.get("set-cookie") ?? "";
      expect(setCookie).toContain("session=;");
    });
  });
});
