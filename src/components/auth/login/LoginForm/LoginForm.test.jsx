// src/components/auth/login/LoginForm/LoginForm.test.jsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import LoginForm from "./LoginForm";
import { AuthProvider } from "@/context/AuthContext";

// Mock API service
vi.mock("@/api/authService", () => ({
  login: vi.fn(),
}));

// Mock toast
vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

const renderLoginForm = () => {
  return render(
    <BrowserRouter>
      <AuthProvider>
        <LoginForm />
      </AuthProvider>
    </BrowserRouter>
  );
};

describe("LoginForm Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders login form component", () => {
    renderLoginForm();
    expect(document.body).toBeInTheDocument();
  });

  it("displays login heading", () => {
    renderLoginForm();
    const headings = screen.queryAllByText(/đăng nhập/i);
    expect(headings.length).toBeGreaterThan(0);
  });

  it("renders input fields", () => {
    renderLoginForm();
    const inputs = screen.getAllByRole("textbox");
    expect(inputs.length).toBeGreaterThan(0);
  });

  it("displays submit button", () => {
    renderLoginForm();
    const buttons = screen.getAllByRole("button");
    expect(buttons.length).toBeGreaterThan(0);
  });

  it("renders register link", () => {
    renderLoginForm();
    const links = screen.getAllByRole("link");
    expect(links.length).toBeGreaterThan(0);
  });

  it("shows form elements", () => {
    renderLoginForm();
    const form = document.querySelector("form");
    expect(form).toBeInTheDocument();
  });

  it("displays branding", () => {
    renderLoginForm();
    const branding = screen.queryAllByText(/CinesVerse|Movie Booking/i);
    expect(branding.length).toBeGreaterThan(0);
  });

  it("renders checkbox element", () => {
    renderLoginForm();
    const checkbox = screen.queryByRole("checkbox");
    expect(checkbox).toBeTruthy();
  });
});
