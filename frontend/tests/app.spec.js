import { test, expect } from "@playwright/test";

test("application loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: /Application Monitoring Lab/i })).toBeVisible();
  await expect(page.getByText("Monitoring endpoints")).toBeVisible();
});

test("can generate an order", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("button", { name: /Create simulated order/i }).click();
  await expect(page.getByText("Order created")).toBeVisible();
});

test("health endpoint is available", async ({ request }) => {
  const response = await request.get("http://localhost:4000/health");
  expect(response.ok()).toBeTruthy();
});
