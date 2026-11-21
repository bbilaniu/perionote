import { once } from "node:events";
import { mkdtemp, mkdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import type { AddressInfo, Server } from "node:net";
import { afterAll, beforeAll, expect, test } from "vitest";
import { createExportServer } from "../../scripts/serve-export.mjs";

let directory: string;
let server: Server;
let baseURL: string;

beforeAll(async () => {
  directory = await mkdtemp(path.join(tmpdir(), "hygienenote-export-server-"));
  const root = path.join(directory, "out");
  await mkdir(path.join(root, "form"), { recursive: true });
  await Promise.all([
    writeFile(path.join(root, "index.html"), "<h1>Export</h1>"),
    writeFile(path.join(root, "form", "index.html"), "<h1>Form</h1>"),
    writeFile(path.join(root, "app.js"), "window.exportReady = true;"),
    writeFile(path.join(root, "app.css"), "body { color: black; }"),
    writeFile(path.join(root, "form", "index.txt"), "static route data"),
    writeFile(path.join(directory, "outside.txt"), "Outside the export"),
  ]);
  server = createExportServer(root);
  server.listen(0, "127.0.0.1");
  await once(server, "listening");
  baseURL = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
});

afterAll(async () => {
  if (server?.listening) {
    server.close();
    await once(server, "close");
  }
  if (directory) await rm(directory, { recursive: true, force: true });
});

test("serves exported pages, scripts, styles, and route data with their content types", async () => {
  for (const [route, type, body] of [
    ["/", "text/html", "<h1>Export</h1>"],
    ["/form/", "text/html", "<h1>Form</h1>"],
    ["/app.js", "text/javascript", "window.exportReady = true;"],
    ["/app.css", "text/css", "body { color: black; }"],
    ["/form/index.txt", "text/plain", "static route data"],
  ]) {
    const response = await fetch(`${baseURL}${route}`);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain(type);
    expect(await response.text()).toBe(body);
  }
});

test("redirects directory routes with their query string and supports HEAD", async () => {
  const response = await fetch(`${baseURL}/form?mode=review`, { redirect: "manual" });
  expect(response.status).toBe(308);
  expect(response.headers.get("location")).toBe("/form/?mode=review");
  const head = await fetch(`${baseURL}/form/`, { method: "HEAD" });
  expect(head.status).toBe(200);
  expect(head.headers.get("content-length")).toBe(String("<h1>Form</h1>".length));
  expect(await head.text()).toBe("");
});

test("rejects writes, missing files, malformed paths, and paths outside the export", async () => {
  expect((await fetch(`${baseURL}/`, { method: "POST" })).status).toBe(405);
  expect((await fetch(`${baseURL}/missing.js`)).status).toBe(404);
  expect((await fetch(`${baseURL}/%invalid`)).status).toBe(400);
  expect((await fetch(`${baseURL}/..%2Foutside.txt`)).status).toBe(403);
});
