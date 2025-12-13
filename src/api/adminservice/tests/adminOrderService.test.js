import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("/src/api/fetchConfig.js", () => ({
  apiFetch: vi.fn(),
}));

import { apiFetch } from "/src/api/fetchConfig.js";
import * as SUT from "../adminOrderService";

beforeEach(() => {
  vi.clearAllMocks();
});

describe("adminOrderService", () => {
  /* ===================== BOOKINGS (ADMIN VIEW) ===================== */

  it("getBookingById: GET /bookings/{bookingId}", async () => {
    apiFetch.mockResolvedValueOnce({ data: { bookingId: "b1" } });

    const res = await SUT.getBookingById("b1");

    expect(apiFetch).toHaveBeenCalledWith("/bookings/b1");
    expect(res).toEqual({ bookingId: "b1" });
  });

  it("updateBookingQr: PATCH /bookings/{id}/qr body { qrCodeUrl }", async () => {
    apiFetch.mockResolvedValueOnce({ data: { bookingId: "b1", qrCodeUrl: "https://qr" } });

    const res = await SUT.updateBookingQr("b1", "https://qr");

    expect(apiFetch).toHaveBeenCalledWith("/bookings/b1/qr", {
      method: "PATCH",
      body: JSON.stringify({ qrCodeUrl: "https://qr" }),
    });
    expect(res).toEqual({ bookingId: "b1", qrCodeUrl: "https://qr" });
  });

  /* ===================== PAYMENTS & REFUNDS ===================== */

  it("searchPayments: GET /payments/search (no filters) => no query", async () => {
    apiFetch.mockResolvedValueOnce({ data: [{ id: "p1" }] });

    const res = await SUT.searchPayments();

    expect(apiFetch).toHaveBeenCalledWith("/payments/search");
    expect(res).toEqual([{ id: "p1" }]);
  });

  it("searchPayments: buildQuery bỏ undefined/null/'' và giữ đúng thứ tự bookingId,userId,status,method,startDate,endDate", async () => {
    apiFetch.mockResolvedValueOnce({ data: [] });

    await SUT.searchPayments({
      bookingId: "b1",
      userId: "",
      status: "SUCCESS",
      method: "PAYPAL",
      startDate: "2025-01-01",
      endDate: "2025-01-31",
    });

    expect(apiFetch).toHaveBeenCalledWith(
      "/payments/search?bookingId=b1&status=SUCCESS&method=PAYPAL&startDate=2025-01-01&endDate=2025-01-31"
    );
  });

  it("createPaymentOrder: POST /payments/order (JSON body)", async () => {
    const payload = { bookingId: "b1", paymentMethod: "PAYPAL", amount: 150.0 };
    apiFetch.mockResolvedValueOnce({ data: { orderId: "ORD-1" } });

    const res = await SUT.createPaymentOrder(payload);

    expect(apiFetch).toHaveBeenCalledWith("/payments/order", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    expect(res).toEqual({ orderId: "ORD-1" });
  });

  it("capturePayment: POST /payments/order/capture (JSON body)", async () => {
    const payload = { paymentMethod: "PAYPAL", transactionId: "T1" };
    apiFetch.mockResolvedValueOnce({ data: { paymentId: "pay1", status: "SUCCESS" } });

    const res = await SUT.capturePayment(payload);

    expect(apiFetch).toHaveBeenCalledWith("/payments/order/capture", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    expect(res).toEqual({ paymentId: "pay1", status: "SUCCESS" });
  });

  it("requestRefund: POST /payments/{paymentId}/refund body { reason }", async () => {
    apiFetch.mockResolvedValueOnce({ data: { paymentId: "pay1", status: "REFUND_PENDING" } });

    const res = await SUT.requestRefund("pay1", "User requested");

    expect(apiFetch).toHaveBeenCalledWith("/payments/pay1/refund", {
      method: "POST",
      body: JSON.stringify({ reason: "User requested" }),
    });
    expect(res).toEqual({ paymentId: "pay1", status: "REFUND_PENDING" });
  });

  /* ===================== MOMO IPN (DEV TOOL) ===================== */

  it("getMomoIpnTest: GET /payments/momo/ipn", async () => {
    apiFetch.mockResolvedValueOnce({ data: { ok: true } });

    const res = await SUT.getMomoIpnTest();

    expect(apiFetch).toHaveBeenCalledWith("/payments/momo/ipn");
    expect(res).toEqual({ ok: true });
  });

  it("postMomoIpnTest: POST /payments/momo/ipn (JSON body)", async () => {
    const body = { partnerCode: "MOMO", orderId: "ORD-1" };
    apiFetch.mockResolvedValueOnce({ data: { received: true } });

    const res = await SUT.postMomoIpnTest(body);

    expect(apiFetch).toHaveBeenCalledWith("/payments/momo/ipn", {
      method: "POST",
      body: JSON.stringify(body),
    });
    expect(res).toEqual({ received: true });
  });

  it("return rule: nếu apiFetch trả trực tiếp object/array không có data thì trả nguyên", async () => {
    apiFetch.mockResolvedValueOnce([{ id: "pRaw" }]);

    const res = await SUT.searchPayments({ status: "SUCCESS" });

    expect(res).toEqual([{ id: "pRaw" }]);
  });
});
