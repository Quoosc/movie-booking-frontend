// src/layouts/tests/MainLayout.test.jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import MainLayout from "../MainLayout";

vi.mock("@/components/common/Navbar", () => ({
  default: () => <nav data-testid="navbar">Navbar</nav>,
}));

vi.mock("@/components/common/Footer", () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}));

describe("MainLayout", () => {
  it("renders Navbar, Outlet, and Footer", () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route
              index
              element={<div data-testid="page-content">Home Page</div>}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    );

    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();
    expect(screen.getByTestId("page-content")).toBeInTheDocument();
  });

  it("renders nested route content via Outlet", () => {
    render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route
              path="about"
              element={<div data-testid="about-page">About</div>}
            />
          </Route>
        </Routes>
      </BrowserRouter>
    );

    expect(screen.queryByTestId("about-page")).not.toBeInTheDocument();
  });

  it("has correct layout structure with flex classes", () => {
    const { container } = render(
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<div>Content</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    );

    const layoutDiv = container.querySelector(".min-h-screen.flex.flex-col");
    expect(layoutDiv).toBeInTheDocument();

    const main = screen.getByRole("main");
    expect(main).toHaveClass("flex-1");
  });
});
