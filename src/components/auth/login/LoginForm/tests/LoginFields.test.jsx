import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";
import LoginFields from "../LoginFields";

const navigateMock = vi.fn();

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal();
  return { ...actual, useNavigate: () => navigateMock };
});

// ✅ mock inline, không dùng toastMock top-level
vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/utils/constants", () => ({ USE_EMAIL_VERIFY: false }));

const loginMock = vi.fn();
vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ login: loginMock }),
}));

// ✅ import lại toast để access được mock funcs
import { toast } from "react-toastify";

describe("LoginFields", () => {
  beforeEach(() => {
    navigateMock.mockReset();
    loginMock.mockReset();
    toast.success.mockReset();
    toast.error.mockReset();
  });

  function renderWithRoute({ from = "/", initialPath = "/auth/login" } = {}) {
    return render(
      <MemoryRouter
        initialEntries={[{ pathname: initialPath, state: { from } }]}
      >
        <LoginFields />
      </MemoryRouter>
    );
  }

  async function fillAndSubmit({ email, password }) {
    const user = userEvent.setup();
    const emailInput = screen.getByLabelText("Email");
    const passInput = screen.getByLabelText("Mật khẩu");

    await user.clear(emailInput);
    await user.type(emailInput, email);

    await user.clear(passInput);
    if (password) await user.type(passInput, password);

    await user.click(screen.getByRole("button", { name: /đăng nhập/i }));
  }

  it("validates empty email", async () => {
    renderWithRoute();

    const user = userEvent.setup();
    await user.click(screen.getByRole("button", { name: /đăng nhập/i }));

    expect(await screen.findByText("Vui lòng nhập email.")).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("validates invalid email format", async () => {
    renderWithRoute();

    await fillAndSubmit({ email: "abc", password: "123456" });

    expect(
      await screen.findByText("Định dạng email không hợp lệ.")
    ).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("validates empty password", async () => {
    renderWithRoute();

    await fillAndSubmit({ email: "a@b.com", password: "" });

    expect(
      await screen.findByText("Vui lòng nhập mật khẩu.")
    ).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("validates password length < 6", async () => {
    renderWithRoute();

    await fillAndSubmit({ email: "a@b.com", password: "123" });

    expect(
      await screen.findByText("Mật khẩu phải có ít nhất 6 ký tự.")
    ).toBeInTheDocument();
    expect(loginMock).not.toHaveBeenCalled();
  });

  it("login success ADMIN navigates to /admin", async () => {
    loginMock.mockResolvedValue({ role: "ADMIN" });
    renderWithRoute({ from: "/checkout" });

    await fillAndSubmit({ email: "admin@cv.com", password: "123456" });

    expect(loginMock).toHaveBeenCalledWith(
      { email: "admin@cv.com", password: "123456" },
      false // rememberMe default
    );

    expect(toast.success).toHaveBeenCalled();
    expect(navigateMock).toHaveBeenCalledWith("/admin", { replace: true });
  });

  it("login success USER navigates to from (not auth pages)", async () => {
    loginMock.mockResolvedValue({ role: "USER" });
    renderWithRoute({ from: "/checkout" });

    await fillAndSubmit({ email: "u@cv.com", password: "123456" });

    expect(navigateMock).toHaveBeenCalledWith("/checkout", { replace: true });
    expect(navigateMock).toHaveBeenCalledWith("/checkout", { replace: true });
  });

  it("login success USER navigates to / when from is /auth/login", async () => {
    loginMock.mockResolvedValue({ role: "USER" });
    renderWithRoute({ from: "/auth/login" });

    await fillAndSubmit({ email: "u@cv.com", password: "123456" });

    expect(navigateMock).toHaveBeenCalledWith("/", { replace: true });
  });

  it("login fail shows toast.error and does not navigate", async () => {
    loginMock.mockRejectedValue(new Error("Sai mật khẩu"));
    renderWithRoute({ from: "/checkout" });

    await fillAndSubmit({ email: "u@cv.com", password: "123456" });

    expect(toast.error).toHaveBeenCalledWith("Sai mật khẩu");
    expect(navigateMock).not.toHaveBeenCalled();
  });
});
