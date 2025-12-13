import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import PaymentCallbackPage from "../page.jsx";
import { capturePayment } from "@/api/paymentService";

vi.mock("@/api/paymentService", () => ({
  capturePayment: vi.fn(),
}));

const navigateMock = vi.fn();
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
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

    vi.spyOn(console, "log").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    console.log.mockRestore?.();
    console.error.mockRestore?.();
    vi.restoreAllMocks();
  });

  it("shows error when missing transactionId or method", async () => {
    const user = userEvent.setup();

    renderWithUrl("/payment-callback");

    expect(
      await screen.findByText("Có lỗi xảy ra khi xử lý thanh toán.")
    ).toBeInTheDocument();

    expect(capturePayment).not.toHaveBeenCalled();

    const btn = screen.getByRole("button", { name: /về trang chủ/i });
    await user.click(btn);

    expect(navigateMock).toHaveBeenCalledWith("/", { replace: true });
  });

  it("calls capturePayment and navigates to checkout-success on success", async () => {
    const realSetTimeout = globalThis.setTimeout;
    const timeoutSpy = vi
      .spyOn(globalThis, "setTimeout")
      .mockImplementation((fn, ms, ...args) => {
        // chỉ chạy ngay timeout 1200ms của PaymentCallbackPage
        if (Number(ms) === 1200) {
          fn(...args);
          return 0;
        }
        return realSetTimeout(fn, ms, ...args);
      });

    capturePayment.mockResolvedValue({
      code: 200,
      data: { bookingId: "b-1" },
    });

    renderWithUrl("/payment-callback?transactionId=tx-1&method=momo");

    expect(
      await screen.findByText("Thanh toán thành công!")
    ).toBeInTheDocument();

    expect(navigateMock).toHaveBeenCalledWith(
      "/checkout-success?bookingId=b-1&method=MOMO",
      { replace: true }
    );

    timeoutSpy.mockRestore();
  });

  it("uses bookingId from query when API response has no bookingId", async () => {
    const realSetTimeout = globalThis.setTimeout;
    const timeoutSpy = vi
      .spyOn(globalThis, "setTimeout")
      .mockImplementation((fn, ms, ...args) => {
        if (Number(ms) === 1200) {
          fn(...args);
          return 0;
        }
        return realSetTimeout(fn, ms, ...args);
      });

    capturePayment.mockResolvedValue({ code: 200, data: {} });

    renderWithUrl(
      "/payment-callback?transactionId=tx-1&method=PAYPAL&bookingId=bq-9"
    );

    expect(
      await screen.findByText("Thanh toán thành công!")
    ).toBeInTheDocument();

    expect(navigateMock).toHaveBeenCalledWith(
      "/checkout-success?bookingId=bq-9&method=PAYPAL",
      { replace: true }
    );

    timeoutSpy.mockRestore();
  });

  it("shows error when wrapper.code = 409 (already processed)", async () => {
    capturePayment.mockResolvedValue({
      code: 409,
      message: "Đã xử lý giao dịch",
    });

    renderWithUrl("/payment-callback?transactionId=tx-1&method=MOMO");

    expect(
      await screen.findByText("Có lỗi xảy ra khi xử lý thanh toán.")
    ).toBeInTheDocument();

    expect(screen.getByText(/đã xử lý giao dịch/i)).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("shows generic failure when wrapper.code != 200 and not 409", async () => {
    capturePayment.mockResolvedValue({
      code: 500,
      message: "Gateway failed",
    });

    renderWithUrl("/payment-callback?transactionId=tx-1&method=MOMO");

    expect(
      await screen.findByText("Có lỗi xảy ra khi xử lý thanh toán.")
    ).toBeInTheDocument();

    expect(screen.getByText(/gateway failed/i)).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("shows error when success but no bookingId anywhere", async () => {
    capturePayment.mockResolvedValue({ code: 200, data: {} });

    renderWithUrl("/payment-callback?transactionId=tx-1&method=MOMO");

    expect(
      await screen.findByText("Có lỗi xảy ra khi xử lý thanh toán.")
    ).toBeInTheDocument();

    expect(
      screen.getByText(/không tìm thấy thông tin vé/i)
    ).toBeInTheDocument();
    expect(navigateMock).not.toHaveBeenCalled();
  });

  it("shows error when capturePayment throws", async () => {
    capturePayment.mockRejectedValue(new Error("network"));

    renderWithUrl("/payment-callback?transactionId=tx-1&method=MOMO");

    expect(
      await screen.findByText("Có lỗi xảy ra khi xử lý thanh toán.")
    ).toBeInTheDocument();

    expect(
      screen.getByText(/có lỗi xảy ra khi xác nhận thanh toán/i)
    ).toBeInTheDocument();

    expect(navigateMock).not.toHaveBeenCalled();
  });
});
