import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MemoryRouter } from "react-router-dom";

import AccountPasswordPage from "../page.jsx";

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

const changePasswordMock = vi.fn();
vi.mock("@/api/userService", () => ({
  changePassword: (...args) => changePasswordMock(...args),
}));

function renderPage(path = "/account/account-password") {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <AccountPasswordPage />
    </MemoryRouter>
  );
}

/**
 * Tìm input password dựa theo "text label" hiển thị trên UI
 * (không cần <label htmlFor=...>).
 *
 * Assumption phổ biến trong layout form: label text và input nằm chung 1 block/container.
 */
function getPasswordInputByTextLabel(labelRegex) {
  const labelEl = screen.getByText(labelRegex);

  // 1) Thử tìm input password trong block gần nhất
  const block =
    labelEl.closest("[data-field]") ||
    labelEl.closest("label") ||
    labelEl.closest("div") ||
    labelEl.parentElement;

  if (block) {
    const inp = block.querySelector('input[type="password"]');
    if (inp) return inp;
  }

  // 2) Fallback: tìm password input gần labelEl theo DOM (rất thực dụng)
  const allPw = Array.from(document.querySelectorAll('input[type="password"]'));
  if (!allPw.length) {
    throw new Error("Không tìm thấy input[type=password] trong trang.");
  }

  // lấy input password đầu tiên xuất hiện sau label trong DOM
  const labelPos = labelEl.compareDocumentPosition(allPw[0]);
  // nếu không chắc, cứ trả về input đầu tiên để test fail rõ ràng
  return allPw[0];
}

function getSubmitButton() {
  const btns = screen.getAllByRole("button", { name: /Đổi mật khẩu/i });
  const submitBtn =
    btns.find((b) => b.getAttribute("type") === "submit") || btns[0];
  if (!submitBtn) throw new Error("Không tìm thấy nút submit Đổi mật khẩu");
  return submitBtn;
}

function getPasswordInputsFromForm() {
  const submitBtn = getSubmitButton();
  const form = submitBtn.closest("form");
  if (!form) throw new Error("Không tìm thấy <form> chứa nút Đổi mật khẩu");

  const inputs = Array.from(form.querySelectorAll("input")).filter((el) => {
    const t = (el.getAttribute("type") || "").toLowerCase();
    return t === "password" || t === "text";
  });

  // mong đợi 3 input: current / new / confirm
  if (inputs.length < 3) {
    throw new Error(
      `Form không đủ input password/text. Found=${inputs.length}`
    );
  }

  return { cur: inputs[0], nw: inputs[1], cf: inputs[2] };
}

describe("AccountPasswordPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthMock.mockReturnValue({
      currentUser: {
        username: "Test User",
        email: "test@email.com",
        membershipTier: { name: "Silver" },
      },
      logout: vi.fn(),
    });
  });

  it("validates empty fields", async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(getSubmitButton());

    expect(
      screen.getByText(/Vui lòng nhập đầy đủ các trường/i)
    ).toBeInTheDocument();
    expect(changePasswordMock).not.toHaveBeenCalled();
  });

  it("validates confirm mismatch", async () => {
    const user = userEvent.setup();
    renderPage();

    const { cur, nw, cf } = getPasswordInputsFromForm();

    await user.type(cur, "oldpass");
    await user.type(nw, "123456");
    await user.type(cf, "1234567");

    await user.click(getSubmitButton());

    expect(
      screen.getByText(/Xác nhận mật khẩu mới không khớp/i)
    ).toBeInTheDocument();
    expect(changePasswordMock).not.toHaveBeenCalled();
  });

  it("validates new password length < 6", async () => {
    const user = userEvent.setup();
    renderPage();

    const { cur, nw, cf } = getPasswordInputsFromForm();

    await user.type(cur, "oldpass");
    await user.type(nw, "12345");
    await user.type(cf, "12345");

    await user.click(getSubmitButton());

    expect(
      screen.getByText(/Mật khẩu mới phải có ít nhất 6 ký tự/i)
    ).toBeInTheDocument();
    expect(changePasswordMock).not.toHaveBeenCalled();
  });

  it("submit success -> calls changePassword with confirmPassword + shows success + clears inputs", async () => {
    const user = userEvent.setup();
    changePasswordMock.mockResolvedValue("OK đổi mật khẩu");

    renderPage();

    const { cur, nw, cf } = getPasswordInputsFromForm();

    await user.type(cur, "oldpass");
    await user.type(nw, "newpass123");
    await user.type(cf, "newpass123");

    await user.click(getSubmitButton());

    await waitFor(() => expect(changePasswordMock).toHaveBeenCalledTimes(1));

    expect(changePasswordMock).toHaveBeenCalledWith({
      currentPassword: "oldpass",
      newPassword: "newpass123",
      confirmPassword: "newpass123",
    });

    expect(screen.getByText(/OK đổi mật khẩu/i)).toBeInTheDocument();
    expect(cur).toHaveValue("");
    expect(nw).toHaveValue("");
    expect(cf).toHaveValue("");
  });

  it("submit fail -> shows error message", async () => {
    const user = userEvent.setup();
    changePasswordMock.mockRejectedValue(new Error("fail api"));

    renderPage();

    const { cur, nw, cf } = getPasswordInputsFromForm();

    await user.type(cur, "oldpass");
    await user.type(nw, "newpass123");
    await user.type(cf, "newpass123");

    await user.click(getSubmitButton());

    await waitFor(() => {
      expect(screen.getByText(/fail api/i)).toBeInTheDocument();
    });
  });
});
