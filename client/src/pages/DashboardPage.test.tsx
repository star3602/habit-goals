import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DashboardPage } from "./DashboardPage";

describe("DashboardPage", () => {
  beforeEach(() => {
    localStorage.setItem("habit-goals-token", "test-token");
    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, options?: RequestInit) => {
        if (url.endsWith("/api/goals") && (!options || options.method === undefined)) {
          return new Response(
            JSON.stringify([
              {
                id: "goal-1",
                user_id: "user-1",
                title: "每天阅读",
                description: "20 分钟",
                created_at: "2026-01-01T00:00:00.000Z",
                checkedInToday: false,
                streak: 0,
                totalDays: 2
              }
            ]),
            { status: 200 }
          );
        }

        if (url.endsWith("/api/goals/goal-1/checkin") && options?.method === "POST") {
          return new Response(JSON.stringify({ id: "checkin-1" }), { status: 201 });
        }

        return new Response(JSON.stringify({ message: "Not found" }), { status: 404 });
      })
    );
  });

  it("calls the check-in API when the button is clicked", async () => {
    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <DashboardPage />
      </MemoryRouter>
    );

    const button = await screen.findByRole("button", { name: /今日打卡/i });
    await user.click(button);

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/goals/goal-1/checkin"),
        expect.objectContaining({
          method: "POST",
          headers: expect.any(Headers)
        })
      );
    });
  });
});
