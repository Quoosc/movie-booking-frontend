import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import AccountProfilePage from "../page";

const navigateMock = vi.fn();

const logoutMock = vi.fn();
const updateUserMock = vi.fn();

const getUserProfileMock = vi.fn();
const updateUserProfileMock = vi.fn();

vi.mock("@/components/common/Navbar", () => ({ default: () => <div data-testid="navbar" /> }));
vi.mock("@/components/common/Footer", () => ({ default: () => <div data-testid="footer" /> }));

vi.mock("@/api/userService", () => ({
  getUserProfile: (...args) => getUserProfileMock(...args),
  updateUserProfile: (...args) => updateUserProfileMock(...args),
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    currentUser: { email: "u@cv.com", username: "User", role: "USER" },
    user: { email: "u@cv.com", username: "User", role: "USER" },
    logout: logoutMock,
    updateUser: updateUserMock,
  }),
}));

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => navigateMock,
    useLocation: () => ({ pathname: "/account/account-profile" }),
  };
});

const sampleProfile = {
  username: "Quoc",
  email: "u@cv.com",
  phoneNumber: "0912345678",
  avatarUrl: "",
  loyaltyPoints: 10,
  createdAt: "2025-12-01T10:00:00.000Z",
  membershipTier: { name: "Silver", discountValue: 5 },
};

describe("AccountProfilePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    getUserProfileMock.mockReset();
    updateUserProfileMock.mockReset();
    logoutMock.mockReset();
    updateUserMock.mockReset();
  });

  it("loads profile success and shows form", async () => {
    getUserProfileMock.mockResolvedValueOnce(sampleProfile);

    render(<AccountProfilePage />);

    // đợi load xong
    expect(await screen.findByText(/cập nhật thông tin/i)).toBeInTheDocument();

    const emailInput = screen.getByDisplayValue("u@cv.com");
    expect(emailInput).toBeDisabled();

    // loyalty points hiển thị
    expect(screen.getByText(/10 pts/i)).toBeInTheDocument();
  });

  it("loads profile fail -> shows error message", async () => {
    getUserProfileMock.mockRejectedValueOnce(new Error("fail"));

    render(<AccountProfilePage />);

    expect(
      await screen.findByText("Không tải được hồ sơ. Vui lòng thử lại.")
    ).toBeInTheDocument();
  });

  it("submit update success -> calls API + updateUser + shows success", async () => {
    getUserProfileMock.mockResolvedValueOnce(sampleProfile);
    updateUserProfileMock.mockResolvedValueOnce({
      username: "Quoc Updated",
      phoneNumber: "0999999999",
      avatarUrl: null,
    });

    const user = userEvent.setup();
    render(<AccountProfilePage />);

    await screen.findByText(/cập nhật thông tin/i);

    const usernameInput = screen.getByPlaceholderText(/nhập tên bạn muốn hiển thị/i);
    const phoneInput = screen.getByPlaceholderText("0912345678");

    await user.clear(usernameInput);
    await user.type(usernameInput, "Quoc Updated");

    await user.clear(phoneInput);
    await user.type(phoneInput, "0999999999");

    await user.click(screen.getByRole("button", { name: /lưu thay đổi/i }));

    await waitFor(() => {
      expect(updateUserProfileMock).toHaveBeenCalledTimes(1);
    });

    expect(updateUserProfileMock).toHaveBeenCalledWith({
      username: "Quoc Updated",
      phoneNumber: "0999999999",
      avatarUrl: null,
    });

    expect(updateUserMock).toHaveBeenCalledWith({
      username: "Quoc Updated",
      phoneNumber: "0999999999",
      avatarUrl: null,
    });

    expect(await screen.findByText("Cập nhật hồ sơ thành công.")).toBeInTheDocument();
  });

  it("submit update fail -> shows error", async () => {
    getUserProfileMock.mockResolvedValueOnce(sampleProfile);
    updateUserProfileMock.mockRejectedValueOnce(new Error("fail update"));

    const user = userEvent.setup();
    render(<AccountProfilePage />);

    await screen.findByText(/cập nhật thông tin/i);

    await user.click(screen.getByRole("button", { name: /lưu thay đổi/i }));

    expect(await screen.findByText("Cập nhật thất bại. Vui lòng thử lại.")).toBeInTheDocument();
  });

  it("reset button restores form values", async () => {
    getUserProfileMock.mockResolvedValueOnce(sampleProfile);

    const user = userEvent.setup();
    render(<AccountProfilePage />);

    await screen.findByText(/cập nhật thông tin/i);

    const usernameInput = screen.getByPlaceholderText(/nhập tên bạn muốn hiển thị/i);

    await user.clear(usernameInput);
    await user.type(usernameInput, "Temp");

    await user.click(screen.getByRole("button", { name: /đặt lại/i }));

    // back to profile.username
    expect(usernameInput).toHaveValue("Quoc");
  });

  it("logout -> calls logout and navigates to /auth/login", async () => {
    getUserProfileMock.mockResolvedValueOnce(sampleProfile);
    logoutMock.mockResolvedValueOnce();

    const user = userEvent.setup();
    render(<AccountProfilePage />);

    await screen.findByText(/cập nhật thông tin/i);

    await user.click(screen.getByRole("button", { name: /đăng xuất/i }));

    await waitFor(() => expect(logoutMock).toHaveBeenCalledTimes(1));
    expect(navigateMock).toHaveBeenCalledWith("/auth/login");
  });

  it("sidebar navigation click -> navigate to member page", async () => {
    getUserProfileMock.mockResolvedValueOnce(sampleProfile);

    const user = userEvent.setup();
    render(<AccountProfilePage />);

    await screen.findByText(/cập nhật thông tin/i);

    await user.click(screen.getByRole("button", { name: /thành viên cinesverse/i }));
    expect(navigateMock).toHaveBeenCalledWith("/account/account-member");
  });
});
