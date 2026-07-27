import { describe, it, expect, vi, beforeEach } from "vitest";

// mock apiFetch
const apiFetchMock = vi.fn();
vi.mock("../fetchConfig", () => ({
  apiFetch: (...args) => apiFetchMock(...args),
}));

import { capturePayment, getPaymentStatus } from "../paymentService";

describe("paymentService", () => {
  beforeEach(() => {
    apiFetchMock.mockReset();
  });

  it("throws when missing transactionId or paymentMethod", async () => {
    await expect(capturePayment({})).rejects.toThrow(
      "transactionId và paymentMethod là bắt buộc"
    );
    await expect(
      capturePayment({ transactionId: "tx" })
    ).rejects.toThrow("transactionId và paymentMethod là bắt buộc");
  });

  it("POST /payments/order/capture with normalized paymentMethod", async () => {
    apiFetchMock.mockResolvedValue({ code: 200, data: { bookingId: "b1" } });

    const res = await capturePayment({
      transactionId: "tx-1",
      paymentMethod: "momo",
    });

    expect(apiFetchMock).toHaveBeenCalledWith("/payments/order/capture", {
      method: "POST",
      body: JSON.stringify({
        transactionId: "tx-1",
        paymentMethod: "MOMO",
      }),
    });

    expect(res).toEqual({ code: 200, data: { bookingId: "b1" } });
  });

  it("GET /payments/order/status with encoded MoMo transaction", async () => {
    apiFetchMock.mockResolvedValue({
      status: "SUCCESS",
      bookingId: "b1",
    });

    await getPaymentStatus({
      transactionId: "order id/1",
      paymentMethod: "momo",
    });

    expect(apiFetchMock).toHaveBeenCalledWith(
      "/payments/order/status?transactionId=order+id%2F1&paymentMethod=MOMO"
    );
  });
});
