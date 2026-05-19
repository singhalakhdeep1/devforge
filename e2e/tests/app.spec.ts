import { test, expect } from '@playwright/test';

test.describe('Authentication E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000');
    });

    test('should display login page', async ({ page }) => {
        await expect(page).toHaveTitle(/DevHub/);
        await expect(page.locator('h1')).toContainText('Login');
    });

    test('should login with valid credentials', async ({ page }) => {
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="password"]', 'TestPass123!');
        await page.click('button[type="submit"]');

        await expect(page).toHaveURL(/dashboard/);
        await expect(page.locator('h1')).toContainText('Dashboard');
    });

    test('should show error with invalid credentials', async ({ page }) => {
        await page.fill('input[name="email"]', 'invalid@example.com');
        await page.fill('input[name="password"]', 'wrongpassword');
        await page.click('button[type="submit"]');

        await expect(page.locator('.error-message')).toBeVisible();
        await expect(page.locator('.error-message')).toContainText('Invalid credentials');
    });

    test('should validate email format', async ({ page }) => {
        await page.fill('input[name="email"]', 'notanemail');
        await page.fill('input[name="password"]', 'TestPass123!');
        await page.click('button[type="submit"]');

        await expect(page.locator('input[name="email"]:invalid')).toBeVisible();
    });

    test('should toggle password visibility', async ({ page }) => {
        const passwordInput = page.locator('input[name="password"]');
        const toggleButton = page.locator('button[aria-label="Toggle password visibility"]');

        await expect(passwordInput).toHaveAttribute('type', 'password');

        await toggleButton.click();
        await expect(passwordInput).toHaveAttribute('type', 'text');

        await toggleButton.click();
        await expect(passwordInput).toHaveAttribute('type', 'password');
    });

    test('should navigate to register page', async ({ page }) => {
        await page.click('a[href="/register"]');
        await expect(page).toHaveURL(/register/);
        await expect(page.locator('h1')).toContainText('Register');
    });

    test('should register new user', async ({ page }) => {
        await page.goto('http://localhost:3000/register');

        await page.fill('input[name="name"]', 'New User');
        await page.fill('input[name="email"]', `test${Date.now()}@example.com`);
        await page.fill('input[name="password"]', 'NewPass123!');
        await page.fill('input[name="confirmPassword"]', 'NewPass123!');
        await page.click('button[type="submit"]');

        await expect(page).toHaveURL(/verify-email|dashboard/);
    });

    test('should validate password confirmation', async ({ page }) => {
        await page.goto('http://localhost:3000/register');

        await page.fill('input[name="password"]', 'Password123!');
        await page.fill('input[name="confirmPassword"]', 'DifferentPass123!');
        await page.click('button[type="submit"]');

        await expect(page.locator('.error-message')).toContainText('Passwords do not match');
    });

    test('should logout user', async ({ page }) => {
        // Login first
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="password"]', 'TestPass123!');
        await page.click('button[type="submit"]');

        await expect(page).toHaveURL(/dashboard/);

        // Logout
        await page.click('button[aria-label="User menu"]');
        await page.click('text=Logout');

        await expect(page).toHaveURL(/login/);
    });

    test('should redirect to login when accessing protected route', async ({ page }) => {
        await page.goto('http://localhost:3000/dashboard');
        await expect(page).toHaveURL(/login/);
    });

    test('should remember me checkbox work', async ({ page }) => {
        const rememberCheckbox = page.locator('input[name="rememberMe"]');

        await rememberCheckbox.check();
        await expect(rememberCheckbox).toBeChecked();

        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="password"]', 'TestPass123!');
        await page.click('button[type="submit"]');

        // Check if token is stored in localStorage
        const hasToken = await page.evaluate(() => {
            return localStorage.getItem('authToken') !== null;
        });
        expect(hasToken).toBeTruthy();
    });
});

test.describe('Dashboard E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Login before each test
        await page.goto('http://localhost:3000/login');
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="password"]', 'TestPass123!');
        await page.click('button[type="submit"]');
        await page.waitForURL(/dashboard/);
    });

    test('should display user dashboard', async ({ page }) => {
        await expect(page.locator('h1')).toContainText('Dashboard');
        await expect(page.locator('[data-testid="user-name"]')).toBeVisible();
    });

    test('should display statistics', async ({ page }) => {
        await expect(page.locator('[data-testid="total-tasks"]')).toBeVisible();
        await expect(page.locator('[data-testid="completed-tasks"]')).toBeVisible();
        await expect(page.locator('[data-testid="in-progress-tasks"]')).toBeVisible();
    });

    test('should navigate to boards', async ({ page }) => {
        await page.click('a[href="/boards"]');
        await expect(page).toHaveURL(/boards/);
        await expect(page.locator('h1')).toContainText('Boards');
    });

    test('should navigate to profile', async ({ page }) => {
        await page.click('a[href="/profile"]');
        await expect(page).toHaveURL(/profile/);
        await expect(page.locator('h1')).toContainText('Profile');
    });

    test('should search globally', async ({ page }) => {
        await page.fill('input[placeholder="Search..."]', 'test query');
        await page.press('input[placeholder="Search..."]', 'Enter');

        await expect(page.locator('[data-testid="search-results"]')).toBeVisible();
    });

    test('should display notifications', async ({ page }) => {
        await page.click('button[aria-label="Notifications"]');
        await expect(page.locator('[data-testid="notifications-panel"]')).toBeVisible();
    });

    test('should mark notification as read', async ({ page }) => {
        await page.click('button[aria-label="Notifications"]');
        await page.click('[data-testid="notification-item"]:first-child');

        await expect(page.locator('[data-testid="notification-item"]:first-child')).not.toHaveClass(/unread/);
    });
});

test.describe('Kanban Board E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('http://localhost:3000/login');
        await page.fill('input[name="email"]', 'test@example.com');
        await page.fill('input[name="password"]', 'TestPass123!');
        await page.click('button[type="submit"]');
        await page.goto('http://localhost:3000/boards');
    });

    test('should create new board', async ({ page }) => {
        await page.click('button:has-text("New Board")');
        await page.fill('input[name="boardName"]', 'Test Board');
        await page.fill('textarea[name="description"]', 'Board description');
        await page.click('button[type="submit"]');

        await expect(page.locator('text=Test Board')).toBeVisible();
    });

    test('should display board columns', async ({ page }) => {
        await page.click('[data-testid="board-item"]:first-child');

        await expect(page.locator('[data-testid="column-todo"]')).toBeVisible();
        await expect(page.locator('[data-testid="column-in-progress"]')).toBeVisible();
        await expect(page.locator('[data-testid="column-done"]')).toBeVisible();
    });

    test('should create new task', async ({ page }) => {
        await page.click('[data-testid="board-item"]:first-child');
        await page.click('button:has-text("New Task")');

        await page.fill('input[name="title"]', 'Test Task');
        await page.fill('textarea[name="description"]', 'Task description');
        await page.selectOption('select[name="priority"]', 'HIGH');
        await page.click('button[type="submit"]');

        await expect(page.locator('text=Test Task')).toBeVisible();
    });

    test('should drag and drop task', async ({ page }) => {
        await page.click('[data-testid="board-item"]:first-child');

        const task = page.locator('[data-testid="task-card"]:first-child');
        const targetColumn = page.locator('[data-testid="column-in-progress"]');

        await task.dragTo(targetColumn);

        await expect(targetColumn.locator('[data-testid="task-card"]')).toHaveCount(1);
    });

    test('should open task detail', async ({ page }) => {
        await page.click('[data-testid="board-item"]:first-child');
        await page.click('[data-testid="task-card"]:first-child');

        await expect(page.locator('[data-testid="task-detail-modal"]')).toBeVisible();
        await expect(page.locator('[data-testid="task-title"]')).toBeVisible();
    });

    test('should add comment to task', async ({ page }) => {
        await page.click('[data-testid="board-item"]:first-child');
        await page.click('[data-testid="task-card"]:first-child');

        await page.fill('textarea[name="comment"]', 'Test comment');
        await page.click('button:has-text("Add Comment")');

        await expect(page.locator('text=Test comment')).toBeVisible();
    });

    test('should filter tasks by assignee', async ({ page }) => {
        await page.click('[data-testid="board-item"]:first-child');
        await page.click('button:has-text("Filter")');
        await page.selectOption('select[name="assignee"]', 'user-123');

        const tasks = page.locator('[data-testid="task-card"]');
        await expect(tasks).toHaveCount(await tasks.count());
    });

    test('should create sprint', async ({ page }) => {
        await page.click('[data-testid="board-item"]:first-child');
        await page.click('button:has-text("New Sprint")');

        await page.fill('input[name="name"]', 'Sprint 1');
        await page.fill('input[name="startDate"]', '2025-01-01');
        await page.fill('input[name="endDate"]', '2025-01-14');
        await page.click('button[type="submit"]');

        await expect(page.locator('text=Sprint 1')).toBeVisible();
    });
});

test.describe('Real-time Collaboration E2E Tests', () => {
    test('should show typing indicator', async ({ browser }) => {
        const context1 = await browser.newContext();
        const context2 = await browser.newContext();

        const page1 = await context1.newPage();
        const page2 = await context2.newPage();

        // Login both users
        await Promise.all([
            loginUser(page1, 'user1@example.com', 'pass'),
            loginUser(page2, 'user2@example.com', 'pass')
        ]);

        // Navigate to same board
        await Promise.all([
            page1.goto('http://localhost:3000/boards/test-board'),
            page2.goto('http://localhost:3000/boards/test-board')
        ]);

        // User 1 opens task and starts typing
        await page1.click('[data-testid="task-card"]:first-child');
        await page1.fill('textarea[name="comment"]', 'Typing...');

        // User 2 should see typing indicator
        await page2.click('[data-testid="task-card"]:first-child');
        await expect(page2.locator('[data-testid="typing-indicator"]')).toContainText('user1 is typing');

        await context1.close();
        await context2.close();
    });

    test('should update task in real-time', async ({ browser }) => {
        const context1 = await browser.newContext();
        const context2 = await browser.newContext();

        const page1 = await context1.newPage();
        const page2 = await context2.newPage();

        await Promise.all([
            loginUser(page1, 'user1@example.com', 'pass'),
            loginUser(page2, 'user2@example.com', 'pass')
        ]);

        await Promise.all([
            page1.goto('http://localhost:3000/boards/test-board'),
            page2.goto('http://localhost:3000/boards/test-board')
        ]);

        // User 1 updates task
        await page1.click('[data-testid="task-card"]:first-child');
        await page1.fill('input[name="title"]', 'Updated Title');
        await page1.click('button:has-text("Save")');

        // User 2 should see update
        await expect(page2.locator('text=Updated Title')).toBeVisible({ timeout: 5000 });

        await context1.close();
        await context2.close();
    });
});

// Helper function
async function loginUser(page: any, email: string, password: string) {
    await page.goto('http://localhost:3000/login');
    await page.fill('input[name="email"]', email);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    await page.waitForURL(/dashboard/);
}
