import { expect, it } from "vitest";
import { NextRequest } from "next/server";
import { proxy } from "../proxy";
it("allows local browsing and rejects foreign Host headers", () => {
  expect(proxy(new NextRequest("http://localhost:3000", { headers: { host: "localhost:3000" } })).status).toBe(200);
  expect(proxy(new NextRequest("http://example.com", { headers: { host: "example.com" } })).status).toBe(403);
});
it("rejects cross-origin writes while allowing same-origin settings saves", () => {
  expect(proxy(new NextRequest("http://127.0.0.1:3000/api/settings", { method: "PATCH", headers: { host: "127.0.0.1:3000", origin: "https://example.com" } })).status).toBe(403);
  expect(proxy(new NextRequest("http://127.0.0.1:3000/api/settings", { method: "PATCH", headers: { host: "127.0.0.1:3000", origin: "http://127.0.0.1:3000" } })).status).toBe(200);
});
