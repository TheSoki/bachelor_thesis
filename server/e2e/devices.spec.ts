import { test, expect } from "@playwright/test";

// Make sure each test starts with a fresh authenticated session
test.beforeEach(async ({ page }) => {
    await page.goto("/api/auth/signin");
    await page.getByLabel("Username").fill("sokoma25@osu.cz");
    await page.getByLabel("Password").fill("sokoma25@osu.cz");
    await page.getByRole("button", { name: "Sign in" }).click();
    await expect(page).toHaveURL("/");

    await page.goto("/devices");
});

test.describe("Devices list", () => {
    test("displays devices table with correct columns", async ({ page }) => {
        // Verify table headers
        const expectedColumns = ["Room", "Last Seen", "Device ID", "Token", "Author", "Created At", "Action"];
        for (const column of expectedColumns) {
            await expect(
                page.getByRole("cell", { name: column }).or(page.locator("th", { hasText: column })),
            ).toBeVisible();
        }
    });

    test("shows correct device data in table rows", async ({ page }) => {
        const firstRow = page.locator("tr").filter({ hasText: "C105" });
        await expect(firstRow.getByRole("cell", { name: "1. 9. 2024 0:00:00" })).toBeVisible();
        await expect(firstRow.getByRole("cell", { name: "Marek Sokol" })).toBeVisible();
        await expect(firstRow.getByRole("cell", { name: "1. 9. 2024 1:00:00" })).toBeVisible();

        const secondRow = page.locator("tr").filter({ hasText: "C106" });
        await expect(secondRow.getByRole("cell", { name: "2. 9. 2024 0:00:00" })).toBeVisible();
        await expect(secondRow.getByRole("cell", { name: "Marek Sokol" })).toBeVisible();
        await expect(secondRow.getByRole("cell", { name: "2. 9. 2024 1:00:00" })).toBeVisible();
    });

    test("search functionality filters devices", async ({ page }) => {
        // Type in search
        await page.getByPlaceholder("Search").fill("C105");
        await page.getByRole("button", { name: /search/i }).click();

        // Verify filtered results
        const firstRow = page.locator("tr").filter({ hasText: "C105" });
        await expect(firstRow.getByRole("cell", { name: "C105" })).toBeVisible();

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
        await expect(prevButton).toHaveAttribute("href", "/devices?page=0&limit=10");

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
        await expect(nextButton).toHaveAttribute("href", "/devices?page=2&limit=10");

        // Test navigation
        await nextButton.click();
        await expect(page).toHaveURL("/devices?page=2&limit=10");

        // Verify that Previous button is now enabled on page 2
        await expect(page.getByRole("link", { name: "Go to previous page" })).not.toHaveClass(
            /pointer-events-none opacity-50/,
        );

        // Test navigation back
        await page.getByRole("link", { name: "Go to previous page" }).click();
        await expect(page).toHaveURL("/devices?page=1&limit=10");

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
        await page.goto("/devices?page=2&limit=10");

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

    test("device management buttons are functional", async ({ page }) => {
        // Test Create Device button
        await expect(page.getByRole("button", { name: "Create Device" })).toBeVisible();

        // Test row action buttons
        await expect(page.getByRole("button", { name: "Update" }).first()).toBeVisible();
        await expect(page.getByRole("button", { name: "Delete" }).first()).toBeVisible();
    });

    test("displays correct device count in table caption", async ({ page }) => {
        const caption = page.locator("table caption");
        await expect(caption).toContainText("50 devices");
    });

    test("handles empty state when no devices exist", async ({ page }) => {
        // Mock empty response
        await page.route(
            "**/api/trpc/device.list?batch=1&input=%7B%220%22%3A%7B%22json%22%3A%7B%22page%22%3A1%2C%22limit%22%3A10%2C%22search%22%3A%22%22%7D%7D%7D",
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
        await page.goto("/devices");

        const caption = page.locator("table caption");
        await expect(caption).toContainText("No devices");
    });
});

test.describe("Device Management Modals", () => {
    test.describe("Create Device Modal", () => {
        test.beforeEach(async ({ page }) => {
            await page.getByRole("button", { name: "Create Device" }).click();
            await expect(page.getByRole("dialog")).toBeVisible();
            await expect(page.getByRole("heading", { name: "Create Device" })).toBeVisible();
        });

        test("displays form with all required fields", async ({ page }) => {
            // Verify all form fields are present
            await expect(page.getByLabel("Building ID")).toBeVisible();
            await expect(page.getByLabel("Room ID")).toBeVisible();
            await expect(page.getByRole("button", { name: "Create", disabled: true })).toBeVisible();
        });

        test("creates device successfully with valid data", async ({ page }) => {
            // Mock successful creation
            await page.route("**/api/trpc/device.create*", async (route) => {
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
            await page.getByLabel("Building ID").fill("B");
            await page.getByLabel("Room ID").fill("200");

            // Submit should be enabled after filling form
            await expect(page.getByRole("button", { name: "Create" })).not.toBeDisabled();

            // Submit form
            await page.getByRole("button", { name: "Create" }).click();

            // Verify success toast
            await expect(page.getByText("Device created successfully")).toBeVisible();
            await expect(page.getByRole("dialog")).not.toBeVisible();
        });

        test("shows validation errors for invalid input", async ({ page }) => {
            // Partially fill form
            await page.getByLabel("Room ID").fill("2");

            // Submit empty form
            await page.getByRole("button", { name: "Create" }).click();
            await expect(page.getByText("Building ID must be one or two letters")).toBeVisible();
            await expect(page.getByText("Room ID must be three numbers")).toBeVisible();
        });
    });

    test.describe("Update Device Modal", () => {
        test.beforeEach(async ({ page }) => {
            // Mock device data for update
            await page.route("**/api/trpc/device.update*", async (route) => {
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

            await page.route("**/api/trpc/device.getById*", async (route) => {
                await route.fulfill({
                    status: 200,
                    body: JSON.stringify([
                        {
                            result: {
                                data: {
                                    json: {
                                        id: "1",
                                        buildingId: "B",
                                        roomId: "200",
                                    },
                                },
                            },
                        },
                    ]),
                });
            });

            await page.getByRole("button", { name: "Update" }).first().click();
            await expect(page.getByRole("dialog")).toBeVisible();
            await expect(page.getByRole("heading", { name: "Update Device" })).toBeVisible();
        });

        test("loads existing device data", async ({ page }) => {
            // Wait for form to be populated
            await expect(page.getByLabel("Building ID")).toHaveValue("B");
            await expect(page.getByLabel("Room ID")).toHaveValue("200");
            await expect(page.getByRole("button", { name: "Update", disabled: true })).toBeVisible();
        });

        test("updates device successfully", async ({ page }) => {
            // Mock successful update
            await page.route("**/api/trpc/device.update*", async (route) => {
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

            // Update building ID
            await page.getByLabel("Building ID").fill("X");
            await expect(page.getByRole("button", { name: "Update" })).not.toBeDisabled();

            await page.getByRole("button", { name: "Update" }).click();

            // Verify success
            await expect(page.getByText("Device updated successfully")).toBeVisible();
            await expect(page.getByRole("dialog")).not.toBeVisible();
        });
    });

    test.describe("Delete Device Modal", () => {
        test.beforeEach(async ({ page }) => {
            await page.getByRole("button", { name: "Delete" }).first().click();
            await expect(page.getByRole("dialog")).toBeVisible();

            // Mock successful deletion
            await page.route("**/api/trpc/device.delete*", async (route) => {
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
            await expect(page.getByText(/Are you absolutely sure/)).toBeVisible();
            await expect(page.getByText(/This action cannot be undone/)).toBeVisible();
            await expect(page.getByRole("button", { name: "Confirm" })).toBeVisible();
        });

        test("deletes device and shows success message", async ({ page }) => {
            await page.getByRole("button", { name: "Confirm" }).click();

            // Verify success message
            await expect(page.getByText("Device deleted successfully")).toBeVisible();
            await expect(page.getByRole("dialog")).not.toBeVisible();
        });

        test("closes modal when cancelled", async ({ page }) => {
            await page.getByRole("button", { name: "Close" }).click();
            await expect(page.getByRole("dialog")).not.toBeVisible();
        });
    });

    test.describe("Error Handling", () => {
        test("handles API errors in create modal", async ({ page }) => {
            await page.route("**/api/trpc/device.create*", async (route) => {
                await route.fulfill({
                    status: 500,
                    body: JSON.stringify([
                        {
                            error: {
                                json: {
                                    message: "Error adding device",
                                    code: -32603,
                                    data: {
                                        code: "INTERNAL_SERVER_ERROR",
                                        httpStatus: 500,
                                        stack: "Error: Error adding device",
                                        path: "device.create",
                                    },
                                },
                            },
                        },
                    ]),
                });
            });

            await page.getByRole("button", { name: "Create Device" }).click();
            await page.getByLabel("Building ID").fill("B");
            await page.getByLabel("Room ID").fill("200");
            await page.getByRole("button", { name: "Create" }).click();

            await expect(page.getByText("Failed to create device")).toBeVisible();
            await expect(page.getByRole("dialog")).toBeVisible();
        });

        test("handles API errors in update modal", async ({ page }) => {
            await page.route("**/api/trpc/device.update*", async (route) => {
                await route.fulfill({
                    status: 500,
                    body: JSON.stringify([
                        {
                            error: {
                                json: {
                                    message: "Error updating device",
                                    code: -32603,
                                    data: {
                                        code: "INTERNAL_SERVER_ERROR",
                                        httpStatus: 500,
                                        stack: "Error: Error updating device",
                                        path: "device.update",
                                    },
                                },
                            },
                        },
                    ]),
                });
            });

            await page.getByRole("button", { name: "Update" }).first().click();
            await page.getByLabel("Building ID").fill("B");
            await page.getByRole("button", { name: "Update" }).click();

            await expect(page.getByText("Failed to update device")).toBeVisible();
            await expect(page.getByRole("dialog")).toBeVisible();
        });

        test("handles API errors in delete modal", async ({ page }) => {
            await page.route("**/api/trpc/device.delete*", async (route) => {
                await route.fulfill({
                    status: 500,
                    body: JSON.stringify([
                        {
                            error: {
                                json: {
                                    message: "Error deleting device",
                                    code: -32603,
                                    data: {
                                        code: "INTERNAL_SERVER_ERROR",
                                        httpStatus: 500,
                                        stack: "Error: Error deleting device",
                                        path: "device.delete",
                                    },
                                },
                            },
                        },
                    ]),
                });
            });

            await page.getByRole("button", { name: "Delete" }).first().click();
            await page.getByRole("button", { name: "Confirm" }).click();

            await expect(page.getByText("Failed to delete device")).toBeVisible();
            await expect(page.getByRole("dialog")).toBeVisible();
        });
    });
});
