import { expect, test, type Page } from "@playwright/test";

// The rating UI on /post/demo, which uses the in-memory mock (starts at 4.6 from 128: 5:92 4:24 3:8 2:3 1:1).
// Each page load starts the mock afresh. localStorage flags: shoof-mock-fail = "1" fails writes, shoof-mock-reason
// forces signed_out or own_post.

const DEMO = "/post/demo";

/**
 * Fails the test on any console error or uncaught exception on the page. One is expected and skipped: a signed-out
 * visitor's session check (POST /auth/refresh) answers 401, which the browser logs as a failed resource.
 */
function watchConsole(page: Page) {
  const problems: string[] = [];
  page.on("console", (message) => {
    if (message.type() !== "error") return;
    if (message.text().includes("status of 401") && message.location().url.endsWith("/auth/refresh")) return;
    problems.push(`${message.text()} (${message.location().url})`);
  });
  page.on("pageerror", (error) => problems.push(error.message));
  return problems;
}

async function openDemo(page: Page, flags: Record<string, string> = {}) {
  await page.addInitScript((values) => {
    for (const [key, value] of Object.entries(values)) localStorage.setItem(key, value);
  }, flags);
  await page.goto(DEMO);
}

const card = (page: Page) => page.locator("section.rt-card");
const star = (page: Page, n: number) => card(page).locator("label.rt-target").nth(n - 1);
const status = (page: Page) => card(page).getByRole("status");
const barCount = (page: Page, stars: number) => card(page).locator(".rt-bars li").nth(5 - stars).locator(".rt-bc");

/** The three places the numbers show: meta line, facts list and the Ratings card. */
async function expectNumbers(page: Page, average: string, count: number) {
  await expect(page.locator(".phead .meta .stars")).toContainText(`${average}(${count} ratings)`);
  await expect(page.locator("dl.facts")).toContainText(`${average} from ${count}`);
  await expect(card(page).locator(".rt-avg-n")).toHaveText(average);
  await expect(card(page).locator(".rt-avg .rt-muted")).toHaveText(`${count} ratings`);
}

async function waitForRadios(page: Page) {
  await expect(card(page).getByRole("radio")).toHaveCount(5);
}

async function rate(page: Page, n: number) {
  await star(page, n).click();
  await expect(status(page)).toHaveText(`Saved. You rated this ${n} out of 5.`);
}

test.describe("ratings on /post/demo", () => {
  let problems: string[];

  test.beforeEach(({ page }) => {
    problems = watchConsole(page);
  });

  test.afterEach(() => {
    expect(problems).toEqual([]);
  });

  test("starts at 4.6 from 128 in the meta line, the facts and the card", async ({ page }) => {
    await openDemo(page);
    await waitForRadios(page);
    await expectNumbers(page, "4.6", 128);
    await expect(barCount(page, 5)).toHaveText("92");
    await expect(card(page).locator(".rt-word")).toHaveText("Not rated yet");
  });

  test("hovering previews a word and leaving goes back", async ({ page }) => {
    await openDemo(page);
    await waitForRadios(page);
    await star(page, 2).hover();
    await expect(card(page).locator(".rt-word")).toHaveText("Needs work");
    await card(page).locator("h2").hover();
    await expect(card(page).locator(".rt-word")).toHaveText("Not rated yet");
  });

  test("rating 4 saves and moves every number together", async ({ page }) => {
    await openDemo(page);
    await waitForRadios(page);
    await star(page, 4).click();
    await expect(status(page)).toHaveText("Saving…");
    await expect(status(page)).toHaveText("Saved. You rated this 4 out of 5.");
    await expectNumbers(page, "4.6", 129);
    await expect(barCount(page, 4)).toHaveText("25");
    await expect(card(page).getByRole("radio", { name: "4 stars, Great" })).toBeChecked();
  });

  test("arrow keys send one write, with the last value", async ({ page }) => {
    await openDemo(page);
    await waitForRadios(page);
    await rate(page, 4);
    await page.evaluate(() => {
      window.__shoofMockWrites = [];
    });

    await card(page).getByRole("radio", { name: "4 stars, Great" }).focus();
    await page.keyboard.press("ArrowRight");
    await expect(status(page)).toHaveText("Saved. You rated this 5 out of 5.");
    await page.waitForTimeout(800);
    const writes = await page.evaluate(() => window.__shoofMockWrites);
    expect(writes).toEqual([{ postId: "demo", method: "PUT", value: 5 }]);
  });

  test("a run of arrow presses is still one write", async ({ page }) => {
    await openDemo(page);
    await waitForRadios(page);
    await rate(page, 1);
    await page.evaluate(() => {
      window.__shoofMockWrites = [];
    });

    await card(page).getByRole("radio", { name: "1 star, Not for me" }).focus();
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await page.keyboard.press("ArrowRight");
    await expect(status(page)).toHaveText("Saved. You rated this 4 out of 5.");
    await page.waitForTimeout(800);
    expect(await page.evaluate(() => window.__shoofMockWrites)).toEqual([{ postId: "demo", method: "PUT", value: 4 }]);
  });

  test("Remove rating, then Undo", async ({ page }) => {
    await openDemo(page);
    await waitForRadios(page);
    await rate(page, 4);
    await expectNumbers(page, "4.6", 129);

    await card(page).getByRole("button", { name: "Remove rating" }).click();
    await expect(status(page)).toHaveText("Rating removed.");
    await expectNumbers(page, "4.6", 128);

    await card(page).getByRole("button", { name: "Undo" }).click();
    await expect(status(page)).toHaveText("Saved. You rated this 4 out of 5.");
    await expectNumbers(page, "4.6", 129);
  });

  test("a failed save reverts with Try again, which works once the API is back", async ({ page }) => {
    await openDemo(page);
    await waitForRadios(page);
    await page.evaluate(() => localStorage.setItem("shoof-mock-fail", "1"));

    await star(page, 3).click();
    await expect(status(page)).toHaveText("Couldn't save your rating. Check your connection and try again.");
    await expectNumbers(page, "4.6", 128);
    await expect(card(page).getByRole("radio", { name: "3 stars, Good" })).not.toBeChecked();

    await page.evaluate(() => localStorage.removeItem("shoof-mock-fail"));
    await card(page).getByRole("button", { name: "Try again" }).click();
    await expect(status(page)).toHaveText("Saved. You rated this 3 out of 5.");
    await expectNumbers(page, "4.6", 129);
    await expect(barCount(page, 3)).toHaveText("9");
  });

  test("signed out: a Log in to rate link back to the ratings, and no radios", async ({ page }) => {
    await openDemo(page, { "shoof-mock-reason": "signed_out" });
    const login = card(page).getByRole("link", { name: "Log in to rate" });
    await expect(login).toHaveAttribute("href", `/login?next=${encodeURIComponent("/post/demo#h-ratings")}`);
    await expect(card(page).getByRole("radio")).toHaveCount(0);
  });

  test("own site: says so, and no radios", async ({ page }) => {
    await openDemo(page, { "shoof-mock-reason": "own_post" });
    await expect(card(page)).toContainText("You can't rate your own site.");
    await expect(card(page).getByRole("radio")).toHaveCount(0);
  });

  test.describe("rate prompt", () => {
    /** Visit live site, then leave the tab and come back more than 3 seconds later. */
    async function visitAndComeBack(page: Page) {
      const popup = page.waitForEvent("popup");
      await page.getByRole("link", { name: /Visit live site/ }).click();
      await (await popup).close();
      await page.evaluate(() => {
        Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "hidden" });
        document.dispatchEvent(new Event("visibilitychange"));
      });
      await page.waitForTimeout(3200);
      await page.evaluate(() => {
        Object.defineProperty(document, "visibilityState", { configurable: true, get: () => "visible" });
        document.dispatchEvent(new Event("visibilitychange"));
      });
    }

    const prompt = (page: Page) => page.getByRole("region", { name: "Rate this site" });

    test("never shows on load, then asks after a visit and saves through the same state", async ({ page }) => {
      await openDemo(page);
      await waitForRadios(page);
      await expect(prompt(page)).toHaveCount(0);

      await visitAndComeBack(page);
      await expect(prompt(page)).toBeVisible();
      await expect(prompt(page)).toContainText("How was yourgame.example.com?");

      await prompt(page).locator("label.rt-target").nth(2).click();
      await expect(page.getByText("Thanks! You rated it 3 · Good.")).toBeVisible();
      await expectNumbers(page, "4.6", 129);
      await expect(barCount(page, 3)).toHaveText("9");
    });

    test("stays dismissed after Not now and a reload", async ({ page }) => {
      await openDemo(page);
      await waitForRadios(page);
      await visitAndComeBack(page);
      await prompt(page).getByRole("button", { name: "Not now" }).click();
      await expect(prompt(page)).toHaveCount(0);
      expect(await page.evaluate(() => localStorage.getItem("shoof-rate-prompt:demo"))).toBe("dismissed");

      await page.reload();
      await waitForRadios(page);
      await visitAndComeBack(page);
      await page.waitForTimeout(500);
      await expect(prompt(page)).toHaveCount(0);
    });

    test("Escape closes it when focus is inside", async ({ page }) => {
      await openDemo(page);
      await waitForRadios(page);
      await visitAndComeBack(page);
      await prompt(page).getByRole("button", { name: "Not now" }).focus();
      await page.keyboard.press("Escape");
      await expect(prompt(page)).toHaveCount(0);
    });
  });
});
