import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import PrivateRoute from "../PrivateRoute";

let mockAuth = { isAuthenticated: false, loading: false };

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => mockAuth,
}));

function LoginPage() {
  const location = useLocation();
  return (
    <div>
      LOGIN
      <div data-testid="from">{location.state?.from || ""}</div>
    </div>
  );
}

function ProtectedPage() {
  return <div>PROTECTED</div>;
}

describe("PrivateRoute", () => {
  beforeEach(() => {
    mockAuth = { isAuthenticated: false, loading: false };
  });

  it("shows loading when loading=true", () => {
    mockAuth = { isAuthenticated: false, loading: true };

    render(
      <MemoryRouter initialEntries={["/account/account-profile"]}>
        <Routes>
          <Route element={<PrivateRoute />}>
            <Route path="/account/account-profile" element={<ProtectedPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Đang tải...")).toBeInTheDocument();
  });

  it("redirects to /auth/login when not authenticated and passes state.from", () => {
    mockAuth = { isAuthenticated: false, loading: false };

    render(
      <MemoryRouter initialEntries={["/account/account-profile"]}>
        <Routes>
          <Route path="/auth/login" element={<LoginPage />} />
          <Route element={<PrivateRoute />}>
            <Route path="/account/account-profile" element={<ProtectedPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("LOGIN")).toBeInTheDocument();
    expect(screen.getByTestId("from")).toHaveTextContent("/account/account-profile");
  });

  it("renders nested route when authenticated", () => {
    mockAuth = { isAuthenticated: true, loading: false };

    render(
      <MemoryRouter initialEntries={["/account/account-profile"]}>
        <Routes>
          <Route element={<PrivateRoute />}>
            <Route path="/account/account-profile" element={<ProtectedPage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("PROTECTED")).toBeInTheDocument();
  });
});
