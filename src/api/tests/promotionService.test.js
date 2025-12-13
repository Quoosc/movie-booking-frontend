import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("../fetchConfig", () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from "../fetchConfig";
import * as SUT from "../promotionService";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("promotionService", () => {
  const originalError = console.error;

  afterEach(() => {
    console.error = originalError;
  });

  it("getValidPromotions: GET /promotions?filter=valid returns res.data", async () => {
    apiFetch.mockResolvedValueOnce({ data: [{ promotionId: "p1", code: "SALE20" }] });

    const res = await SUT.getValidPromotions();

    expect(apiFetch).toHaveBeenCalledWith("/promotions?filter=valid");
    expect(res).toEqual([{ promotionId: "p1", code: "SALE20" }]);
  });

  it("getValidPromotions: nếu apiFetch trả raw array thì return raw", async () => {
    apiFetch.mockResolvedValueOnce([{ promotionId: "pX" }]);

    const res = await SUT.getValidPromotions();

    expect(res).toEqual([{ promotionId: "pX" }]);
  });

  it("validatePromotion: code rỗng => valid=false và không gọi api", async () => {
    const res = await SUT.validatePromotion("   ");

    expect(apiFetch).not.toHaveBeenCalled();
    expect(res).toEqual({
      valid: false,
      message: "Vui lòng nhập mã khuyến mãi.",
    });
  });

  it("validatePromotion: success => GET /promotions/code/{encoded} + return valid=true", async () => {
    apiFetch.mockResolvedValueOnce({ data: { promotionId: "p1", code: "SALE 20" } });

    const res = await SUT.validatePromotion("SALE 20");

    expect(apiFetch).toHaveBeenCalledWith("/promotions/code/SALE%2020");
    expect(res).toEqual({
      valid: true,
      promotion: { promotionId: "p1", code: "SALE 20" },
    });
  });

  it("validatePromotion: api throws => catch => valid=false + message + console.error called", async () => {
    console.error = vi.fn();
    apiFetch.mockRejectedValueOnce(new Error("404"));

    const res = await SUT.validatePromotion("BADCODE");

    expect(console.error).toHaveBeenCalled();
    expect(res).toEqual({
      valid: false,
      message: "Mã khuyến mãi không hợp lệ hoặc đã hết hạn.",
    });
  });
});
