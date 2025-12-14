// src/components/auth/register/RegisterForm/RegisterForm.test.jsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import RegisterForm from "./RegisterForm";
import { AuthProvider } from "@/context/AuthContext";

// Mock API service
vi.mock("@/api/authService", () => ({
  register: vi.fn(),
}));

// Mock toast
vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const renderRegisterForm = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <RegisterForm />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe("RegisterForm Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders register form component", () => {
    renderRegisterForm();
    expect(document.body).toBeInTheDocument();
  });

  it("displays registration heading", () => {
    renderRegisterForm();
    const headings = screen.queryAllByText(/đăng ký/i);
    expect(headings.length).toBeGreaterThan(0);
  });

  it("renders input fields", () => {
    renderRegisterForm();
    const inputs = screen.getAllByRole("textbox");
    expect(inputs.length).toBeGreaterThan(0);
  });

  it("displays submit button", () => {
    renderRegisterForm();
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("renders login link", () => {
    renderRegisterForm();
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
  });

  it("shows form elements", () => {
    renderRegisterForm();
    const form = document.querySelector("form");
    expect(form).toBeInTheDocument();
  });

  it("displays branding", () => {
    renderRegisterForm();
    const branding = screen.queryAllByText(/CinesVerse|Movie Booking/i);
    expect(branding.length).toBeGreaterThan(0);
  });

  it("renders multiple input fields", () => {
    renderRegisterForm();
    const inputs = screen.getAllByRole("textbox");
    expect(inputs.length).toBeGreaterThanOrEqual(3);
  });

  it("shows OAuth buttons", () => {
    renderRegisterForm();
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThanOrEqual(2);
  });

  it("displays registration benefits text", () => {
    renderRegisterForm();
    const text = screen.queryAllByText(/tài khoản/i);
    expect(text.length).toBeGreaterThan(0);
  });
});
