import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
    test("should show sign in page", async ({ page }) => {
        await page.goto("/api/auth/signin");
        await expect(page).toHaveTitle(/Sign In/);
    });

    test("should display error with invalid credentials", async ({ page }) => {
        await page.goto("/api/auth/signin");

        await page.getByLabel("Username").fill("invalid@example.com");
        await page.getByLabel("Password").fill("wrongpassword");
        await page.getByRole("button", { name: "Sign in" }).click();

        await expect(page.getByText("Sign in failed. Check the details you provided are correct.")).toBeVisible();
    });

    test("should successfully sign in with valid credentials", async ({ page }) => {
        await page.goto("/api/auth/signin");

        await page.getByLabel("Username").fill("sokoma25@osu.cz");
        await page.getByLabel("Password").fill("sokoma25@osu.cz");
        await page.getByRole("button", { name: "Sign in" }).click();

        await expect(page).toHaveURL("/");
        await expect(page.getByText("Sign out")).toBeVisible();
    });

    test("should redirect to sign-in for protected routes", async ({ page }) => {
        // only '/' is protected by redirect to signin
        await page.goto("/");
        await expect(page).toHaveURL(/.*signin/);
    });
});
