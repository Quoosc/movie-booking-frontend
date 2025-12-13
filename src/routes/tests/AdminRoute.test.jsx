import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";
import AdminRoute from "../AdminRoute";

let mockAuth = { isAuthenticated: false, isAdmin: false, loading: false };

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

function HomePage() {
  return <div>HOME</div>;
}

function AdminPage() {
  return <div>ADMIN</div>;
}

describe("AdminRoute", () => {
  beforeEach(() => {
    mockAuth = { isAuthenticated: false, isAdmin: false, loading: false };
  });

  it("shows loading when loading=true", () => {
    mockAuth = { isAuthenticated: false, isAdmin: false, loading: true };

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("Đang tải...")).toBeInTheDocument();
  });

  it("redirects to /auth/login when not authenticated and passes state.from", () => {
    mockAuth = { isAuthenticated: false, isAdmin: false, loading: false };

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route path="/auth/login" element={<LoginPage />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("LOGIN")).toBeInTheDocument();
    expect(screen.getByTestId("from")).toHaveTextContent("/admin");
  });

  it("redirects to / when authenticated but not admin", () => {
    mockAuth = { isAuthenticated: true, isAdmin: false, loading: false };

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("HOME")).toBeInTheDocument();
  });

  it("renders children when authenticated and admin", () => {
    mockAuth = { isAuthenticated: true, isAdmin: true, loading: false };

    render(
      <MemoryRouter initialEntries={["/admin"]}>
        <Routes>
          <Route
            path="/admin"
            element={
              <AdminRoute>
                <AdminPage />
              </AdminRoute>
            }
          />
        </Routes>
      </MemoryRouter>
    );

    expect(screen.getByText("ADMIN")).toBeInTheDocument();
  });
});
