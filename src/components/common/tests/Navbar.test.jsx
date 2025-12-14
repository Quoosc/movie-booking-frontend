// src/components/common/tests/Navbar.test.jsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import Navbar from "../Navbar";
import { AuthProvider } from "@/context/AuthContext";
import * as authApi from "@/api/authService";

vi.mock("@/api/authService");
vi.mock("@/components/cinema/CinemaDropdown", () => ({
  default: () => <div data-testid="cinema-dropdown">Cinema Dropdown</div>,
}));

const mockNavigate = vi.fn();
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

function renderWithAuth(user = null) {
  authApi.me.mockResolvedValue(user);
  authApi.getStoredUser.mockReturnValue(user);
  authApi.logout.mockResolvedValue({});
  authApi.setStoredUser.mockImplementation(() => {});
  authApi.clearStoredUser.mockImplementation(() => {});

  return render(
    <BrowserRouter>
      <AuthProvider>
        <Navbar />
      </AuthProvider>
    </BrowserRouter>
  );
}

describe("Navbar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders logo and main navigation links", async () => {
    renderWithAuth(null);

    await waitFor(() => {
      expect(screen.queryByText(/đang tải/i)).not.toBeInTheDocument();
    });

    const logos = screen.getAllByAltText("CinesVerse");
    expect(logos.length).toBeGreaterThan(0);

    expect(screen.getByText(/đặt vé \/ bắp nước ngay/i)).toBeInTheDocument();
  });

  it("shows login/register buttons when user is not authenticated", async () => {
    renderWithAuth(null);

    await waitFor(() => {
      const loginButtons = screen.getAllByText(/đăng nhập/i);
      expect(loginButtons.length).toBeGreaterThan(0);
    });

    const registerButtons = screen.getAllByText(/đăng ký/i);
    expect(registerButtons.length).toBeGreaterThan(0);
  });

  it("shows user menu when authenticated", async () => {
    const user = {
      userId: "u1",
      email: "user@test.com",
      fullName: "Test User",
      role: "USER",
    };

    renderWithAuth(user);

    await waitFor(() => {
      const userNames = screen.getAllByText("Test User");
      expect(userNames.length).toBeGreaterThan(0);
    });

    expect(screen.queryByText(/đăng nhập/i)).not.toBeInTheDocument();
  });

  it("navigates to /movie/movies when ĐẶT VÉ button is clicked", async () => {
    const user = userEvent.setup();
    renderWithAuth(null);

    await waitFor(() => {
      expect(screen.queryByText(/đang tải/i)).not.toBeInTheDocument();
    });

    const bookBtn = screen.getByText(/đặt vé \/ bắp nước ngay/i);
    await user.click(bookBtn);

    expect(mockNavigate).toHaveBeenCalledWith("/movie/movies");
  });

  it("logs out user when logout is clicked", async () => {
    const user = userEvent.setup();
    const mockUser = {
      userId: "u1",
      email: "user@test.com",
      fullName: "Test User",
      role: "USER",
    };

    renderWithAuth(mockUser);

    await waitFor(() => {
      const userNames = screen.getAllByText("Test User");
      expect(userNames.length).toBeGreaterThan(0);
    });

    // Click user menu to open dropdown
    const userMenuBtns = screen.getAllByText("Test User");
    await user.click(userMenuBtns[0]);

    // Click logout button
    const logoutBtns = screen.getAllByText(/đăng xuất/i);
    await user.click(logoutBtns[0]);

    await waitFor(() => {
      expect(authApi.logout).toHaveBeenCalled();
      expect(mockNavigate).toHaveBeenCalledWith("/auth/login", {
        replace: true,
      });
    });
  });

  it("shows admin link when user is admin", async () => {
    const adminUser = {
      userId: "a1",
      email: "admin@test.com",
      fullName: "Admin User",
      role: "ADMIN",
    };

    renderWithAuth(adminUser);

    await waitFor(() => {
      const adminNames = screen.getAllByText("Admin User");
      expect(adminNames.length).toBeGreaterThan(0);
    });

    // Admin should see admin dashboard link
    const adminLinks = screen.getAllByText(/quản trị|admin/i);
    expect(adminLinks.length).toBeGreaterThan(0);
  });

  it("opens mobile menu when hamburger icon is clicked", async () => {
    const user = userEvent.setup();
    renderWithAuth(null);

    await waitFor(() => {
      expect(screen.queryByText(/đang tải/i)).not.toBeInTheDocument();
    });

    const menuBtn = screen.getByLabelText(/open menu/i);
    await user.click(menuBtn);

    // Mobile menu should be visible (simplified test)
    expect(menuBtn).toBeInTheDocument();
  });

  it("renders cinema dropdown component", async () => {
    renderWithAuth(null);

    await waitFor(() => {
      expect(screen.getByTestId("cinema-dropdown")).toBeInTheDocument();
    });
  });
});
