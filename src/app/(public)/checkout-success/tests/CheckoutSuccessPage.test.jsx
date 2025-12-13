import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import CheckoutSuccessPage from "../page.jsx";

// ===== hoisted mocks (để tránh lỗi hoist của vitest) =====
const rr = vi.hoisted(() => {
  let params = new URLSearchParams("");
  let location = { state: {} };
  return {
    navigateMock: vi.fn(),
    setParams: (qs) => (params = new URLSearchParams(qs)),
    getParams: () => params,
    setLocationState: (state) => (location = { state }),
    getLocation: () => location,
  };
});

const bookingApi = vi.hoisted(() => ({
  getBookingById: vi.fn(),
}));

const auth = vi.hoisted(() => ({
  useAuth: vi.fn(),
}));

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return {
    ...actual,
    useNavigate: () => rr.navigateMock,
    useLocation: () => rr.getLocation(),
    useSearchParams: () => [rr.getParams()],
  };
});

vi.mock("@/api/bookingService", () => ({
  getBookingById: bookingApi.getBookingById,
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: auth.useAuth,
}));

// Mock UI nặng để test nhẹ DOM
vi.mock("@/components/common/Navbar", () => ({ default: () => <div data-testid="navbar" /> }));
vi.mock("@/components/common/Footer", () => ({ default: () => <div data-testid="footer" /> }));
vi.mock("@/components/shared/Buttons/HomeButton", () => ({ default: () => <button>Home</button> }));

beforeEach(() => {
  vi.clearAllMocks();
  rr.setParams("");
  rr.setLocationState({});
  auth.useAuth.mockReturnValue({ user: null });
});

function sampleBooking(overrides = {}) {
  return {
    bookingId: "abcd-efgh-1234-5678",
    movieTitle: "Interstellar",
    movieDescription: "Space journey",
    cinemaName: "CinesVerse Quận 1",
    roomName: "Room 2",
    showtimeStartTime: "2025-12-13T12:30:00.000Z",
    seats: [
      { rowLabel: "A", seatNumber: 1, seatType: "VIP" },
      { rowLabel: "A", seatNumber: 2, seatType: "VIP" },
    ],
    finalPrice: 150000,
    totalPrice: 180000,
    discountValue: 30000,
    posterUrl: "https://example.com/poster.jpg",
    qrCode: "https://example.com/qr.png",
    bookedAt: "2025-12-13T12:00:00.000Z",
    ...overrides,
  };
}

describe("CheckoutSuccessPage", () => {
  it("shows error when missing bookingId", async () => {
    render(<CheckoutSuccessPage />);

    expect(await screen.findByText(/Thiếu mã đặt vé/i)).toBeInTheDocument();

    await userEvent.click(screen.getByRole("button", { name: /về trang chủ/i }));
    expect(rr.navigateMock).toHaveBeenCalledWith("/");
  });

  it("loads booking by bookingId from query", async () => {
    rr.setParams("bookingId=BK01&method=PAYPAL");
    bookingApi.getBookingById.mockResolvedValue(sampleBooking({ bookingId: "BK01" }));

    render(<CheckoutSuccessPage />);

    expect(screen.getByText(/Đang tải thông tin vé/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(bookingApi.getBookingById).toHaveBeenCalledWith("BK01");
    });

    expect(await screen.findByText(/Interstellar/i)).toBeInTheDocument();
    expect(screen.getByText(/CinesVerse Quận 1/i)).toBeInTheDocument();
    expect(screen.getByText(/Ghế VIP/i)).toBeInTheDocument();
    expect(screen.getByText(/A01, A02/i)).toBeInTheDocument();
  });

  it("uses bookingId from state when provided", async () => {
    rr.setParams("bookingId=FROM_QUERY&method=MOMO");
    rr.setLocationState({ bookingId: "FROM_STATE", paymentMethod: "PAYPAL" });

    bookingApi.getBookingById.mockResolvedValue(sampleBooking({ bookingId: "FROM_STATE" }));

    render(<CheckoutSuccessPage />);

    await waitFor(() => {
      expect(bookingApi.getBookingById).toHaveBeenCalledWith("FROM_STATE");
    });
  });

  it("shows history button only for member USER", async () => {
    rr.setParams("bookingId=BK01&method=PAYPAL");
    bookingApi.getBookingById.mockResolvedValue(sampleBooking({ bookingId: "BK01" }));

    // guest -> không thấy
    auth.useAuth.mockReturnValue({ user: null });
    render(<CheckoutSuccessPage />);
    await screen.findByText(/Interstellar/i);
    expect(screen.queryByRole("button", { name: /Xem lịch sử đặt vé/i })).toBeNull();
  });

  it("member USER clicks history navigates to /account/account-history", async () => {
    rr.setParams("bookingId=BK01&method=PAYPAL");
    bookingApi.getBookingById.mockResolvedValue(sampleBooking({ bookingId: "BK01" }));

    auth.useAuth.mockReturnValue({ user: { role: "USER" } });

    render(<CheckoutSuccessPage />);
    await screen.findByText(/Interstellar/i);

    const btn = screen.getByRole("button", { name: /Xem lịch sử đặt vé/i });
    await userEvent.click(btn);

    expect(rr.navigateMock).toHaveBeenCalledWith("/account/account-history");
  });

  it("shows error when getBookingById throws", async () => {
    rr.setParams("bookingId=BK01&method=PAYPAL");
    bookingApi.getBookingById.mockRejectedValue(new Error("Không tìm thấy booking"));

    render(<CheckoutSuccessPage />);

    expect(await screen.findByText(/Không tìm thấy booking/i)).toBeInTheDocument();
  });
});
