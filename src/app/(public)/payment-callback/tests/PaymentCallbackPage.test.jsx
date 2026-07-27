import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import PaymentCallbackPage from "../page.jsx";
import {
  capturePayment,
  getPaymentStatus,
} from "@/api/paymentService";

vi.mock("@/api/paymentService", () => ({
  capturePayment: vi.fn(),
  getPaymentStatus: vi.fn(),
}));

const navigateMock = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => navigateMock };
});

function renderWithUrl(url) {
  return render(
    <MemoryRouter initialEntries={[url]}>
      <PaymentCallbackPage />
    </MemoryRouter>
  );
}

describe("PaymentCallbackPage", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    capturePayment.mockReset();
    getPaymentStatus.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("rejects callbacks without a transaction and method", async () => {
    const user = userEvent.setup();
    renderWithUrl("/payment-callback");

    expect(
      await screen.findByText("Có lỗi xảy ra khi xử lý thanh toán.")
    ).toBeInTheDocument();
    expect(capturePayment).not.toHaveBeenCalled();
    expect(getPaymentStatus).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: /về trang chủ/i }));
    expect(navigateMock).toHaveBeenCalledWith("/", { replace: true });
  });

  it("captures PayPal and navigates with a durable booking query", async () => {
    capturePayment.mockResolvedValue({
      code: 200,
      data: { bookingId: "booking-1" },
    });

    renderWithUrl("/payment-callback?token=paypal-order&method=paypal");

    expect(
      await screen.findByText("Thanh toán thành công!", {}, { timeout: 2000 })
    ).toBeInTheDocument();
    expect(capturePayment).toHaveBeenCalledWith({
      transactionId: "paypal-order",
      paymentMethod: "PAYPAL",
    });
    expect(getPaymentStatus).not.toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith(
      "/checkout-success?bookingId=booking-1&method=PAYPAL",
      { replace: true }
    );
  });

  it("does not capture MoMo in the browser and trusts persisted IPN state", async () => {
    getPaymentStatus.mockResolvedValue({
      status: "SUCCESS",
      bookingId: "booking-momo",
    });

    renderWithUrl("/payment-callback?orderId=momo-order&method=momo");

    expect(await screen.findByText("Thanh toán thành công!")).toBeInTheDocument();
    expect(getPaymentStatus).toHaveBeenCalledWith({
      transactionId: "momo-order",
      paymentMethod: "MOMO",
    });
    expect(capturePayment).not.toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith(
      "/checkout-success?bookingId=booking-momo&method=MOMO",
      { replace: true }
    );
  });

  it("polls while the MoMo IPN is pending", async () => {
    getPaymentStatus
      .mockResolvedValueOnce({ status: "PENDING", bookingId: "booking-momo" })
      .mockResolvedValueOnce({ status: "SUCCESS", bookingId: "booking-momo" });

    renderWithUrl("/payment-callback?requestId=momo-order");

    expect(
      await screen.findByText("Thanh toán thành công!", {}, { timeout: 2000 })
    ).toBeInTheDocument();
    expect(getPaymentStatus).toHaveBeenCalledTimes(2);
  });

  it("shows the gateway failure persisted by the MoMo IPN", async () => {
    getPaymentStatus.mockResolvedValue({
      status: "FAILED",
      errorMessage: "MoMo rejected the payment",
    });

    renderWithUrl("/payment-callback?orderId=momo-order&method=MOMO");

    expect(
      await screen.findByText("Có lỗi xảy ra khi xử lý thanh toán.")
    ).toBeInTheDocument();
    expect(screen.getByText(/momo rejected the payment/i)).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("uses bookingId from the query when PayPal omits it", async () => {
    capturePayment.mockResolvedValue({ code: 200, data: {} });

    renderWithUrl(
      "/payment-callback?token=paypal-order&method=PAYPAL&bookingId=booking-query"
    );

    await waitFor(() => {
      expect(navigateMock).toHaveBeenCalledWith(
        "/checkout-success?bookingId=booking-query&method=PAYPAL",
        { replace: true }
      );
    });
  });

  it("shows an actionable error when payment verification fails", async () => {
    getPaymentStatus.mockRejectedValue(new Error("network unavailable"));

    renderWithUrl("/payment-callback?orderId=momo-order&method=MOMO");

    expect(await screen.findByText(/network unavailable/i)).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
