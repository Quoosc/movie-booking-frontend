import { beforeEach, describe, expect, it, vi } from "vitest";

vi.mock("/src/api/fetchConfig.js", () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from "../../../api/fetchConfig.js";
import {
  getReviewsForModeration,
  moderateReview,
} from "../adminReviewService.js";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("adminReviewService", () => {
  it("gửi đầy đủ bộ lọc phân trang và giữ metadata từ API", async () => {
    apiFetch.mockResolvedValueOnce({
      data: {
        items: [{ reviewId: "review-1" }],
        pagination: { currentPage: 2, lastPage: 4, total: 32 },
      },
    });

    const result = await getReviewsForModeration({
      status: "HIDDEN",
      reportedOnly: true,
      page: 2,
      perPage: 10,
    });

    expect(apiFetch).toHaveBeenCalledWith(
      "/movies/reviews/moderation?status=HIDDEN&reportedOnly=true&page=2&perPage=10",
    );
    expect(result.pagination).toEqual({ currentPage: 2, lastPage: 4, total: 32 });
  });

  it("gửi trạng thái và lý do khi kiểm duyệt", async () => {
    apiFetch.mockResolvedValueOnce({
      data: { reviewId: "review-1", status: "HIDDEN" },
    });

    await moderateReview("review-1", "HIDDEN", "Nội dung công kích cá nhân");

    expect(apiFetch).toHaveBeenCalledWith("/movies/reviews/review-1/moderate", {
      method: "PATCH",
      body: JSON.stringify({
        status: "HIDDEN",
        reason: "Nội dung công kích cá nhân",
      }),
    });
  });
});
