import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";

import AccountMemberPage from "../page.jsx";

// ---- mocks ----
const navigateMock = vi.fn();
vi.mock("react-router-dom", async (importActual) => {
  const actual = await importActual();
  return {
    ...actual,
    useNavigate: () => navigateMock,
  };
});

vi.mock("@/components/common/Navbar", () => ({
  default: () => <div data-testid="navbar" />,
}));
vi.mock("@/components/common/Footer", () => ({
  default: () => <div data-testid="footer" />,
}));

const useAuthMock = vi.fn();
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => useAuthMock(),
}));

const getUserLoyaltyMock = vi.fn();
const getActiveMembershipTiersMock = vi.fn();
vi.mock("@/api/userService", () => ({
  getUserLoyalty: (...args) => getUserLoyaltyMock(...args),
  getActiveMembershipTiers: (...args) => getActiveMembershipTiersMock(...args),
}));

function renderPage(path = "/account/account-member") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AccountMemberPage />
    </MemoryRouter>
  );
}

describe("AccountMemberPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    useAuthMock.mockReturnValue({
      currentUser: {
        username: "Test User",
        email: "test@email.com",
        avatarUrl: "",
        membershipTier: { name: "Silver" },
      },
      logout: vi.fn(),
    });
  });

  it("shows loading then renders tier + points + progress", async () => {
    getUserLoyaltyMock.mockResolvedValue({
      loyaltyPoints: 120,
      membershipTier: {
        membershipTierId: "t1",
        name: "Silver",
        minPoints: 100,
        discountValue: 5,
      },
    });

    getActiveMembershipTiersMock.mockResolvedValue([
      {
        membershipTierId: "t1",
        name: "Silver",
        minPoints: 100,
        discountValue: 5,
      },
      {
        membershipTierId: "t2",
        name: "Gold",
        minPoints: 300,
        discountValue: 10,
      },
      {
        membershipTierId: "t3",
        name: "Platinum",
        minPoints: 600,
        discountValue: 15,
      },
    ]);

    const { container } = renderPage();

    expect(
      screen.getByText(/Đang tải thông tin thành viên/i)
    ).toBeInTheDocument();

    await waitFor(() => {
      expect(getUserLoyaltyMock).toHaveBeenCalledTimes(1);
      expect(getActiveMembershipTiersMock).toHaveBeenCalledTimes(1);
    });

    // Current tier name
    expect(screen.getAllByText(/Silver/i).length).toBeGreaterThan(0);

    // Points number (120)
    expect(screen.getByText("120")).toBeInTheDocument();

    // Discount line
    expect(screen.getByText(/Giảm ngay/i)).toBeInTheDocument();
    expect(screen.getAllByText(/5%/i).length).toBeGreaterThan(0);

    // Next tier info text: remaining points to Gold (300 - 120 = 180)
    expect(screen.getByText(/Còn\s*180[\s\S]*Gold/i)).toBeInTheDocument();

    // Progress percent = (120-100)/(300-100)*100 = 10%
    // Find the progress bar div by inline style width
    const progressEl = Array.from(container.querySelectorAll("div")).find(
      (el) => el.style?.width && el.style.width.includes("%")
    );
    expect(progressEl).toBeTruthy();
    const w = parseFloat(progressEl.style.width);
    expect(w).toBeGreaterThanOrEqual(9.9);
    expect(w).toBeLessThanOrEqual(10.1);
  });

  it("shows error when API fails", async () => {
    getUserLoyaltyMock.mockRejectedValue(new Error("fail"));
    getActiveMembershipTiersMock.mockResolvedValue([]);

    renderPage();

    await waitFor(() => {
      expect(
        screen.getByText(/Không thể tải thông tin membership/i)
      ).toBeInTheDocument();
    });
  });

  it("logout button calls logout and redirects to /auth/login", async () => {
    const logoutFn = vi.fn();
    useAuthMock.mockReturnValue({
      currentUser: {
        username: "U",
        email: "u@email.com",
        membershipTier: { name: "Silver" },
      },
      logout: logoutFn,
    });

    getUserLoyaltyMock.mockResolvedValue({
      loyaltyPoints: 0,
      membershipTier: {
        membershipTierId: "t1",
        name: "Silver",
        minPoints: 0,
        discountValue: 0,
      },
    });
    getActiveMembershipTiersMock.mockResolvedValue([
      {
        membershipTierId: "t1",
        name: "Silver",
        minPoints: 0,
        discountValue: 0,
      },
    ]);

    renderPage();

    await waitFor(() => {
      expect(
        screen.queryByText(/Đang tải thông tin thành viên/i)
      ).not.toBeInTheDocument();
    });

    const logoutBtn = screen.getAllByText(/Đăng xuất/i)[0];
    await logoutBtn.click();

    expect(logoutFn).toHaveBeenCalledTimes(1);
    expect(navigateMock).toHaveBeenCalledWith("/auth/login");
  });
});
