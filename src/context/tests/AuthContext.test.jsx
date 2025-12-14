// src/context/tests/AuthContext.test.jsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "../AuthContext";
import * as authApi from "@/api/authService";

vi.mock("@/api/authService");

function TestConsumer() {
  const auth = useAuth();
  return (
    <div>
      <div data-testid="user">{auth.user ? auth.user.email : "null"}</div>
      <div data-testid="role">{auth.role || "null"}</div>
      <div data-testid="isAuthenticated">{auth.isAuthenticated.toString()}</div>
      <div data-testid="isAdmin">{auth.isAdmin.toString()}</div>
      <div data-testid="loading">{auth.loading.toString()}</div>
      <button onClick={() => auth.login({ email: "a@b.com", password: "123" })}>
        Login
      </button>
      <button onClick={auth.logout}>Logout</button>
      <button onClick={auth.refreshProfile}>Refresh</button>
      <button onClick={() => auth.updateUser({ email: "updated@test.com" })}>
        Update
      </button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
    sessionStorage.clear();

    authApi.getStoredUser.mockReturnValue(null);
    authApi.setStoredUser.mockImplementation(() => {});
    authApi.clearStoredUser.mockImplementation(() => {});
    authApi.logout.mockResolvedValue({});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("initializes with null user when no stored user and me() fails", async () => {
    authApi.me.mockRejectedValueOnce(new Error("Unauthorized"));

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    expect(screen.getByTestId("user")).toHaveTextContent("null");
    expect(screen.getByTestId("isAuthenticated")).toHaveTextContent("false");
  });

  it("initializes with user from me() on mount", async () => {
    authApi.me.mockResolvedValueOnce({
      userId: "u1",
      email: "user@test.com",
      role: "USER",
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("user@test.com");
    });

    expect(screen.getByTestId("role")).toHaveTextContent("USER");
    expect(screen.getByTestId("isAuthenticated")).toHaveTextContent("true");
    expect(screen.getByTestId("isAdmin")).toHaveTextContent("false");
    expect(authApi.setStoredUser).toHaveBeenCalled();
  });

  it("login: calls authApi.login + me + sets user", async () => {
    authApi.me.mockRejectedValueOnce(new Error("No token"));

    authApi.login.mockResolvedValueOnce({ success: true });
    authApi.getStoredUser.mockReturnValueOnce({
      userId: "u1",
      email: "stored@test.com",
      role: "USER",
    });
    authApi.me.mockResolvedValueOnce({
      userId: "u1",
      email: "fromAPI@test.com",
      role: "USER",
    });

    const { rerender } = render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("loading")).toHaveTextContent("false");
    });

    await act(async () => {
      screen.getByRole("button", { name: /login/i }).click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("fromAPI@test.com");
    });

    expect(authApi.login).toHaveBeenCalledWith({
      email: "a@b.com",
      password: "123",
    });
    expect(authApi.me).toHaveBeenCalled();
    expect(authApi.setStoredUser).toHaveBeenCalled();
  });

  it("logout: calls authApi.logout + clears user + clears storage", async () => {
    authApi.me.mockResolvedValueOnce({
      userId: "u1",
      email: "user@test.com",
      role: "USER",
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("user@test.com");
    });

    await act(async () => {
      screen.getByRole("button", { name: /logout/i }).click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("null");
    });

    expect(authApi.logout).toHaveBeenCalled();
    expect(authApi.clearStoredUser).toHaveBeenCalled();
    expect(screen.getByTestId("isAuthenticated")).toHaveTextContent("false");
  });

  it("refreshProfile: calls me() and updates user", async () => {
    authApi.me
      .mockResolvedValueOnce({
        userId: "u1",
        email: "old@test.com",
        role: "USER",
      })
      .mockResolvedValueOnce({
        userId: "u1",
        email: "refreshed@test.com",
        role: "USER",
      });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("old@test.com");
    });

    await act(async () => {
      screen.getByRole("button", { name: /refresh/i }).click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent(
        "refreshed@test.com"
      );
    });
  });

  it("updateUser: merges partial user data and persists", async () => {
    authApi.me.mockResolvedValueOnce({
      userId: "u1",
      email: "original@test.com",
      role: "USER",
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("original@test.com");
    });

    await act(async () => {
      screen.getByRole("button", { name: /update/i }).click();
    });

    await waitFor(() => {
      expect(screen.getByTestId("user")).toHaveTextContent("updated@test.com");
    });

    expect(authApi.setStoredUser).toHaveBeenCalledWith(
      expect.objectContaining({ email: "updated@test.com" })
    );
  });

  it("isAdmin is true when user role is ADMIN", async () => {
    authApi.me.mockResolvedValueOnce({
      userId: "a1",
      email: "admin@test.com",
      role: "ADMIN",
    });

    render(
      <AuthProvider>
        <TestConsumer />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId("role")).toHaveTextContent("ADMIN");
    });

    expect(screen.getByTestId("isAdmin")).toHaveTextContent("true");
    expect(screen.getByTestId("isAuthenticated")).toHaveTextContent("true");
  });

  it("throws error when useAuth is used outside AuthProvider", () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    expect(() => {
      render(<TestConsumer />);
    }).toThrow("useAuth must be used within AuthProvider");

    consoleError.mockRestore();
  });
});
