import {
  describe,
  it,
  expect,
  vi,
  beforeEach,
  afterAll,
  beforeAll,
} from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import RegisterFields from "../RegisterFields";

const registerMock = vi.fn();

vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({
    register: registerMock,
  }),
}));

// component có import useNavigate nhưng không dùng để redirect (dùng window.location.href)
// vẫn mock nhẹ cho an toàn
vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => vi.fn(),
  };
});

const { toast } = await import("react-toastify");

let originalLocation;

beforeAll(() => {
  // chặn jsdom navigation khi code set window.location.href
  originalLocation = window.location;
  // eslint-disable-next-line no-delete-var
  delete window.location;
  window.location = { href: "http://localhost:5173/" };
});

afterAll(() => {
  // restore
  window.location = originalLocation;
});

async function fillAndSubmit(
  user,
  { fullName, email, phone, password, confirmPassword }
) {
  const fullNameInput = screen.getByLabelText(/họ và tên/i);
  const emailInput = screen.getByLabelText(/email/i);
  const phoneInput = screen.getByLabelText(/số điện thoại/i);
  const passInput = screen.getByLabelText(/^mật khẩu$/i);
  const confirmInput = screen.getByLabelText(/xác nhận mật khẩu/i);

  await user.clear(fullNameInput);
  if (fullName) await user.type(fullNameInput, fullName);

  await user.clear(emailInput);
  if (email) await user.type(emailInput, email);

  await user.clear(phoneInput);
  if (phone) await user.type(phoneInput, phone);

  await user.clear(passInput);
  if (password) await user.type(passInput, password);

  await user.clear(confirmInput);
  if (confirmPassword) await user.type(confirmInput, confirmPassword);

  await user.click(screen.getByRole("button", { name: /đăng ký/i }));
}

describe("RegisterFields", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    registerMock.mockReset();
    window.location.href = "http://localhost:5173/";
  });

  it("validates empty fullName", async () => {
    const user = userEvent.setup();
    render(<RegisterFields />);

    await fillAndSubmit(user, {
      fullName: "",
      email: "a@cv.com",
      phone: "",
      password: "123456",
      confirmPassword: "123456",
    });

    expect(
      await screen.findByText("Vui lòng nhập họ và tên.")
    ).toBeInTheDocument();
    expect(registerMock).not.toHaveBeenCalled();
  });

  it("validates invalid email format", async () => {
    const user = userEvent.setup();
    render(<RegisterFields />);

    await fillAndSubmit(user, {
      fullName: "Nguyen Van A",
      email: "abc",
      phone: "",
      password: "123456",
      confirmPassword: "123456",
    });

    expect(
      await screen.findByText("Định dạng email không hợp lệ.")
    ).toBeInTheDocument();
    expect(registerMock).not.toHaveBeenCalled();
  });

  it("validates invalid phone", async () => {
    const user = userEvent.setup();
    render(<RegisterFields />);

    await fillAndSubmit(user, {
      fullName: "Nguyen Van A",
      email: "a@cv.com",
      phone: "09ab",
      password: "123456",
      confirmPassword: "123456",
    });

    expect(
      await screen.findByText("Số điện thoại không hợp lệ.")
    ).toBeInTheDocument();
    expect(registerMock).not.toHaveBeenCalled();
  });

  it("validates password length < 6", async () => {
    const user = userEvent.setup();
    render(<RegisterFields />);

    await fillAndSubmit(user, {
      fullName: "Nguyen Van A",
      email: "a@cv.com",
      phone: "",
      password: "123",
      confirmPassword: "123",
    });

    expect(
      await screen.findByText("Mật khẩu phải có ít nhất 6 ký tự.")
    ).toBeInTheDocument();
    expect(registerMock).not.toHaveBeenCalled();
  });

  it("validates confirmPassword mismatch", async () => {
    const user = userEvent.setup();
    render(<RegisterFields />);

    await fillAndSubmit(user, {
      fullName: "Nguyen Van A",
      email: "a@cv.com",
      phone: "",
      password: "123456",
      confirmPassword: "654321",
    });

    expect(
      await screen.findByText("Mật khẩu không trùng khớp.")
    ).toBeInTheDocument();
    expect(registerMock).not.toHaveBeenCalled();
  });

  it("register success -> toast.success + redirect /auth/login", async () => {
    registerMock.mockResolvedValueOnce({ ok: true });

    const user = userEvent.setup();
    render(<RegisterFields />);

    await fillAndSubmit(user, {
      fullName: "  Nguyen Van A  ",
      email: "  a@cv.com ",
      phone: " 0987 654 321 ",
      password: "123456",
      confirmPassword: "123456",
    });

    await waitFor(() => expect(registerMock).toHaveBeenCalledTimes(1));

    expect(registerMock).toHaveBeenCalledWith({
      fullName: "Nguyen Van A",
      email: "a@cv.com",
      phone: "0987 654 321",
      password: "123456",
    });

    expect(toast.success).toHaveBeenCalled();
    await waitFor(() => {
      expect(window.location.href).toBe("/auth/login");
    });
  });

  it("register fail -> toast.error and no redirect", async () => {
    registerMock.mockRejectedValueOnce(new Error("Email đã tồn tại"));

    const user = userEvent.setup();
    render(<RegisterFields />);

    await fillAndSubmit(user, {
      fullName: "Nguyen Van A",
      email: "a@cv.com",
      phone: "",
      password: "123456",
      confirmPassword: "123456",
    });

    await waitFor(() => expect(registerMock).toHaveBeenCalledTimes(1));
    expect(toast.error).toHaveBeenCalledWith("Email đã tồn tại");
    expect(window.location.href).not.toBe("/auth/login");
  });
});
