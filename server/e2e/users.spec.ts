import { test, expect } from "@playwright/test";

// Make sure each test starts with a fresh authenticated session
test.beforeEach(async ({ page }) => {
    await page.goto("/api/auth/signin");
    await page.getByLabel("Username").fill("sokoma25@osu.cz");
    await page.getByLabel("Password").fill("sokoma25@osu.cz");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL("/");

    await page.goto("/users");
});

test.describe("Users list", () => {
    test("displays users table with correct columns", async ({ page }) => {
        // Verify table headers
        const expectedColumns = ["Name", "Email", "Created At", "Action"];
        for (const column of expectedColumns) {
            await expect(
                page.getByRole("cell", { name: column }).or(page.locator("th", { hasText: column })),
            ).toBeVisible();
        }
    });

    test("shows correct user data in table rows", async ({ page }) => {
        const firstRow = page.locator("tr").filter({ hasText: "Marek Sokol" });
        await expect(firstRow.getByRole("cell", { name: "Marek Sokol" })).toBeVisible();
        await expect(firstRow.getByRole("cell", { name: "sokoma25@osu.cz" })).toBeVisible();
        await expect(firstRow.getByRole("cell", { name: "1. 9. 2024 0:00:00" })).toBeVisible();
    });

    test("search functionality filters users", async ({ page }) => {
        // Type in search
        await page.getByPlaceholder("Search").fill("Marek");
        await page.getByRole("button", { name: /search/i }).click();

        // Verify filtered results
        const firstRow = page.locator("tr").filter({ hasText: "Marek Sokol" });
        await expect(firstRow.getByRole("cell", { name: "Marek Sokol" })).toBeVisible();

        // Verify other user is not visible
        const secondRow = page.locator("tr").filter({ hasText: "Whatever" });
        await expect(secondRow).toHaveCount(0);
    });

    test("pagination controls work correctly", async ({ page }) => {
        // Get pagination navigation
        const paginationNav = page.getByRole("navigation", {
            name: "pagination",
        });
        await expect(paginationNav).toBeVisible();

        // Get pagination list and verify it exists
        const paginationList = paginationNav.locator("ul");
        await expect(paginationList).toBeVisible();

        // Test previous button
        const prevButton = paginationNav.getByRole("link", {
            name: "Go to previous page",
        });
        await expect(prevButton).toBeVisible();
        await expect(prevButton).toHaveClass(/pointer-events-none opacity-50/);
        await expect(prevButton).toHaveAttribute("href", "/users?page=0&limit=10");

        // Test current page button
        const pageOneButton = paginationNav.getByRole("link", {
            name: "1",
        });
        await expect(pageOneButton).toBeVisible();
        await expect(pageOneButton).toHaveClass(/pointer-events-none/);
        await expect(pageOneButton).toHaveAttribute("href", "/");

        // Test next button
        const nextButton = paginationNav.getByRole("link", {
            name: "Go to next page",
        });
        await expect(nextButton).toBeVisible();
        await expect(nextButton).not.toHaveClass(/pointer-events-none opacity-50/);
        await expect(nextButton).toHaveAttribute("href", "/users?page=2&limit=10");

        // Test navigation
        await nextButton.click();
        await expect(page).toHaveURL("/users?page=2&limit=10");

        // Verify that Previous button is now enabled on page 2
        await expect(page.getByRole("link", { name: "Go to previous page" })).not.toHaveClass(
            /pointer-events-none opacity-50/,
        );

        // Test navigation back
        await page.getByRole("link", { name: "Go to previous page" }).click();
        await expect(page).toHaveURL("/users?page=1&limit=10");

        // Optional: Test items per page if you have that component
        const itemsPerPage = page.getByRole("combobox", { name: /per page/i });
        if (await itemsPerPage.isVisible()) {
            await itemsPerPage.click();
            await page.getByRole("option", { name: "20 per page" }).click();
            await expect(page).toHaveURL(/limit=20/);
        }
    });

    test("pagination reflects correct page state", async ({ page }) => {
        // Test edge cases and state consistency
        await page.goto("/users?page=2&limit=10");

        // Verify middle page state
        const paginationNav = page.getByRole("navigation", {
            name: "pagination",
        });

        // Previous should be enabled
        const prevButton = paginationNav.getByRole("link", { name: "Go to previous page" });
        await expect(prevButton).not.toHaveClass(/pointer-events-none opacity-50/);

        // Next should be enabled if there are more pages
        const nextButton = paginationNav.getByRole("link", { name: "Go to next page" });
        await expect(nextButton).not.toHaveClass(/pointer-events-none opacity-50/);

        // Current page should be marked
        const currentPage = paginationNav.getByRole("link", { name: "2" });
        await expect(currentPage).toHaveClass(/pointer-events-none/);
    });

    test("user management buttons are functional", async ({ page }) => {
        // Test Create User button
        await expect(page.getByRole("button", { name: "Create User" })).toBeVisible();

        // Test row action buttons
        await expect(page.getByRole("button", { name: "Update" }).first()).toBeVisible();
        await expect(page.getByRole("button", { name: "Delete" }).first()).toBeVisible();
    });

    test("displays correct user count in table caption", async ({ page }) => {
        const caption = page.locator("table caption");
        await expect(caption).toContainText("50 users");
    });

    test("handles empty state when no users exist", async ({ page }) => {
        // Mock empty response
        await page.route(
            "**/api/trpc/user.list?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22page%22%3A1%2C%22limit%22%3A10%2C%22search%22%3A%22%22%7D%7D%7D",
            async (route) => {
                await route.fulfill({
                    status: 200,
                    body: JSON.stringify([
                        {
                            result: {
                                data: {
                                    json: {
                                        list: [],
                                        totalPages: 1,
                                        totalCount: 0,
                                    },
                                },
                            },
                        },
                    ]),
                    headers: { "Content-Type": "application/json" },
                });
            },
        );

        await page.goto("/users");

        const caption = page.locator("table caption");
        await expect(caption).toContainText("No users");
    });
});

test.describe("User Management Modals", () => {
    test.describe("Create User Modal", () => {
        test.beforeEach(async ({ page }) => {
            await page.getByRole("button", { name: "Create User" }).click();
            await expect(page.getByRole("dialog")).toBeVisible();
            await expect(page.getByRole("heading", { name: "Create User" })).toBeVisible();
        });

        test("displays form with all required fields", async ({ page }) => {
            // Verify all form fields are present
            await expect(page.getByLabel("Name")).toBeVisible();
            await expect(page.getByLabel("Email")).toBeVisible();
            await expect(page.getByLabel("Password")).toBeVisible();
            await expect(page.getByRole("button", { name: "Create", disabled: true })).toBeVisible();
        });

        test("creates user successfully with valid data", async ({ page }) => {
            // Mock successful creation
            await page.route("**/api/trpc/user.create*", async (route) => {
                await route.fulfill({
                    status: 200,
                    body: JSON.stringify([
                        {
                            result: {
                                data: {
                                    json: { success: true },
                                },
                            },
                        },
                    ]),
                });
            });

            // Fill in the form
            await page.getByLabel("Name").fill("Test User");
            await page.getByLabel("Email").fill("test@example.com");
            await page.getByLabel("Password").fill("password123");

            // Submit should be enabled after filling form
            await expect(page.getByRole("button", { name: "Create" })).not.toBeDisabled();

            // Submit form
            await page.getByRole("button", { name: "Create" }).click();

            // Verify success toast
            await expect(page.getByText("User created successfully")).toBeVisible();
            await expect(page.getByRole("dialog")).not.toBeVisible();
        });

        test("shows validation errors for invalid input", async ({ page }) => {
            // Partially fill form
            await page.getByLabel("Name").fill("a");

            // Submit empty form
            await page.getByRole("button", { name: "Create" }).click();
            await expect(page.getByText("Name must be at least 3 characters")).toBeVisible();
            await expect(page.getByText("Email must be valid")).toBeVisible();
            await expect(page.getByText("Password must be at least 3 characters")).toBeVisible();
        });
    });

    test.describe("Update User Modal", () => {
        test.beforeEach(async ({ page }) => {
            // Mock user data for update
            await page.route("**/api/trpc/user.update*", async (route) => {
                await route.fulfill({
                    status: 200,
                    body: JSON.stringify([
                        {
                            result: {
                                data: {
                                    json: { success: true },
                                },
                            },
                        },
                    ]),
                });
            });
        });

        test("loads existing user data", async ({ page }) => {
            await page.route("**/api/trpc/user.getById*", async (route) => {
                await route.fulfill({
                    status: 200,
                    body: JSON.stringify([
                        {
                            result: {
                                data: {
                                    json: {
                                        id: "user_001",
                                        name: "Marek Sokol",
                                        email: "sokoma25@osu.cz",
                                    },
                                },
                            },
                        },
                    ]),
                });
            });

            await page.getByRole("button", { name: "Update" }).first().click();
            await expect(page.getByRole("dialog")).toBeVisible();
            await expect(page.getByRole("heading", { name: "Update User" })).toBeVisible();

            // Wait for form to be populated
            await expect(page.getByLabel("Name")).toHaveValue("Marek Sokol");
            await expect(page.getByLabel("Email")).toHaveValue("sokoma25@osu.cz");
            await expect(page.getByLabel("Password")).toHaveValue("");
            await expect(page.getByRole("button", { name: "Update", disabled: true })).toBeVisible();
        });

        test("updates user successfully", async ({ page }) => {
            await page.route("**/api/trpc/user.getById*", async (route) => {
                await route.fulfill({
                    status: 200,
                    body: JSON.stringify([
                        {
                            result: {
                                data: {
                                    json: {
                                        id: "user_002",
                                        name: "Chadrick Cruickshank",
                                        email: "Chadrick_Cruickshank@osu.cz",
                                    },
                                },
                            },
                        },
                    ]),
                });
            });

            await page.getByRole("button", { name: "Update" }).first().click();
            await expect(page.getByRole("dialog")).toBeVisible();
            await expect(page.getByRole("heading", { name: "Update User" })).toBeVisible();

            // Update name
            await page.getByLabel("Name").fill("Updated Name");
            await expect(page.getByRole("button", { name: "Update" })).not.toBeDisabled();

            await page.getByRole("button", { name: "Update" }).click();

            // Verify success
            await expect(page.getByText("User updated successfully")).toBeVisible();
            await expect(page.getByRole("dialog")).not.toBeVisible();
        });

        test("signs out when updating current user", async ({ page }) => {
            await page.route("**/api/trpc/user.getById*", async (route) => {
                await route.fulfill({
                    status: 200,
                    body: JSON.stringify([
                        {
                            result: {
                                data: {
                                    json: {
                                        id: "user_001",
                                        name: "Marek Sokol",
                                        email: "sokoma25@osu.cz",
                                    },
                                },
                            },
                        },
                    ]),
                });
            });

            await page.getByRole("button", { name: "Update" }).first().click();
            await expect(page.getByRole("dialog")).toBeVisible();
            await expect(page.getByRole("heading", { name: "Update User" })).toBeVisible();

            // Update current user
            await page.getByLabel("Name").fill("Updated Name");
            await page.getByRole("button", { name: "Update" }).click();

            // Should redirect to sign in
            await expect(page).toHaveURL(/.*signin/);
        });
    });

    test.describe("Delete User Modal", () => {
        test.beforeEach(async ({ page }) => {
            await page.route("**/api/trpc/user.delete*", async (route) => {
                await route.fulfill({
                    status: 200,
                    body: JSON.stringify([
                        {
                            result: {
                                data: {
                                    json: { success: true },
                                },
                            },
                        },
                    ]),
                });
            });
        });

        test("shows confirmation dialog with warning message", async ({ page }) => {
            await page.getByRole("button", { name: "Delete" }).nth(1).click();
            await expect(page.getByRole("dialog")).toBeVisible();

            await expect(page.getByText(/Are you absolutely sure/)).toBeVisible();
            await expect(page.getByText(/This action cannot be undone/)).toBeVisible();
            await expect(page.getByRole("button", { name: "Confirm" })).toBeVisible();
        });

        test("deletes user and shows success message", async ({ page }) => {
            await page.getByRole("button", { name: "Delete" }).nth(1).click();
            await expect(page.getByRole("dialog")).toBeVisible();

            await page.getByRole("button", { name: "Confirm" }).click();

            // Verify success message
            await expect(page.getByText("User deleted successfully")).toBeVisible();
            await expect(page.getByRole("dialog")).not.toBeVisible();
        });

        test("signs out when deleting current user", async ({ page }) => {
            await page.getByRole("button", { name: "Delete" }).nth(0).click();
            await expect(page.getByRole("dialog")).toBeVisible();

            await page.getByRole("button", { name: "Confirm" }).click();

            // Should redirect to sign in
            await expect(page).toHaveURL(/.*signin/);
        });

        test("closes modal when cancelled", async ({ page }) => {
            await page.getByRole("button", { name: "Delete" }).first().click();
            await expect(page.getByRole("dialog")).toBeVisible();

            await page.getByRole("button", { name: "Close" }).click();
            await expect(page.getByRole("dialog")).not.toBeVisible();
        });
    });

    test.describe("Error Handling", () => {
        test("handles API errors in create modal", async ({ page }) => {
            await page.route("**/api/trpc/user.create*", async (route) => {
                await route.fulfill({
                    status: 500,
                    body: JSON.stringify([
                        {
                            error: {
                                json: {
                                    message: "Error adding user",
                                    code: -32603,
                                    data: {
                                        code: "INTERNAL_SERVER_ERROR",
                                        httpStatus: 500,
                                        stack: "Error: Error adding user",
                                        path: "user.create",
                                    },
                                },
                            },
                        },
                    ]),
                });
            });

            await page.getByRole("button", { name: "Create User" }).click();
            await page.getByLabel("Name").fill("Test User");
            await page.getByLabel("Email").fill("test@example.com");
            await page.getByLabel("Password").fill("password123");
            await page.getByRole("button", { name: "Create" }).click();

            await expect(page.getByText("Failed to create user")).toBeVisible();
            await expect(page.getByRole("dialog")).toBeVisible();
        });

        test("handles API errors in update modal", async ({ page }) => {
            await page.route("**/api/trpc/user.update*", async (route) => {
                await route.fulfill({
                    status: 500,
                    body: JSON.stringify([
                        {
                            error: {
                                json: {
                                    message: "Error updating user",
                                    code: -32603,
                                    data: {
                                        code: "INTERNAL_SERVER_ERROR",
                                        httpStatus: 500,
                                        stack: "Error: Error updating user",
                                        path: "user.update",
                                    },
                                },
                            },
                        },
                    ]),
                });
            });

            await page.getByRole("button", { name: "Update" }).first().click();
            await page.getByLabel("Name").fill("Updated Name");
            await page.getByRole("button", { name: "Update" }).click();

            await expect(page.getByText("Failed to update user")).toBeVisible();
            await expect(page.getByRole("dialog")).toBeVisible();
        });

        test("handles API errors in delete modal", async ({ page }) => {
            await page.route("**/api/trpc/user.delete*", async (route) => {
                await route.fulfill({
                    status: 500,
                    body: JSON.stringify([
                        {
                            error: {
                                json: {
                                    message: "Error deleting user",
                                    code: -32603,
                                    data: {
                                        code: "INTERNAL_SERVER_ERROR",
                                        httpStatus: 500,
                                        stack: "Error: Error deleting user",
                                        path: "user.delete",
                                    },
                                },
                            },
                        },
                    ]),
                });
            });

            await page.getByRole("button", { name: "Delete" }).first().click();
            await page.getByRole("button", { name: "Confirm" }).click();

            await expect(page.getByText("Failed to delete user")).toBeVisible();
            await expect(page.getByRole("dialog")).toBeVisible();
        });
    });
});
