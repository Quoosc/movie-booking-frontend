// src/layouts/tests/AdminLayout.test.jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AdminLayout from "../AdminLayout";

vi.mock("../AdminTopbar", () => ({
  default: () => <div data-testid="admin-topbar">Admin Topbar</div>,
}));

vi.mock("../AdminSidebar", () => ({
  default: ({ isMobile }) => (
    <div data-testid={isMobile ? "admin-sidebar-mobile" : "admin-sidebar"}>
      Admin Sidebar {isMobile ? "(Mobile)" : ""}
    </div>
  ),
}));

describe("AdminLayout", () => {
  it("renders AdminTopbar, AdminSidebar (desktop and mobile), and Outlet", () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AdminLayout />}>
            <Route
              index
              element={<div data-testid="admin-content">Admin Dashboard</div>}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    );

    expect(screen.getByTestId("admin-topbar")).toBeInTheDocument();
    expect(screen.getByTestId("admin-sidebar")).toBeInTheDocument();
    expect(screen.getByTestId("admin-sidebar-mobile")).toBeInTheDocument();
    expect(screen.getByTestId("admin-content")).toBeInTheDocument();
  });

  it("renders nested admin route via Outlet", () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AdminLayout />}>
            <Route
              path="users"
              element={<div data-testid="users-page">Users</div>}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    );

    expect(screen.queryByTestId("users-page")).not.toBeInTheDocument();
  });

  it("has gradient background and neon glow effects", () => {
    const { container } = render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<div>Content</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    );

    const layoutDiv = container.querySelector(".min-h-screen");
    expect(layoutDiv).toHaveClass("bg-gradient-to-b");
    expect(layoutDiv).toHaveClass("from-[#050024]");
    expect(layoutDiv).toHaveClass("via-[#0b0630]");
    expect(layoutDiv).toHaveClass("to-[#020015]");

    const glowDiv = container.querySelector(
      ".pointer-events-none.absolute.inset-0"
    );
    expect(glowDiv).toBeInTheDocument();
  });

  it("renders main content card with correct styling", () => {
    const { container } = render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<div>Content</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    );

    const contentSection = container.querySelector("section.rounded-3xl");
    expect(contentSection).toBeInTheDocument();
    expect(contentSection).toHaveClass("bg-gradient-to-br");
    expect(contentSection).toHaveClass("from-[#1a0033]/90");
    expect(contentSection).toHaveClass("border-white/10");
  });

  it("has responsive grid layout for sidebar and content", () => {
    const { container } = render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<AdminLayout />}>
            <Route index element={<div>Content</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    );

    const gridDiv = container.querySelector(
      ".grid.lg\\:grid-cols-\\[260px\\,1fr\\]"
    );
    expect(gridDiv).toBeInTheDocument();
  });
});
