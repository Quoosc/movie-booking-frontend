// src/components/common/tests/Footer.test.jsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import Footer from "../Footer";

describe("Footer", () => {
  it("renders CinesVerse logo and tagline", () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    const logo = screen.getByAltText("CinesVerse");
    expect(logo).toBeInTheDocument();

    expect(screen.getByText(/Movie Booking Platform/i)).toBeInTheDocument();
    expect(screen.getByText("CinesVerse")).toBeInTheDocument();
    expect(screen.getByText(/BE HAPPY, BE A STAR/i)).toBeInTheDocument();
  });

  it("renders Tài khoản section with login/register links", () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    expect(screen.getByText("Tài khoản")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /đăng nhập/i })).toHaveAttribute(
      "href",
      "/auth/login"
    );
    expect(screen.getByRole("link", { name: /đăng ký/i })).toHaveAttribute(
      "href",
      "/auth/register"
    );
    expect(screen.getByRole("link", { name: /membership/i })).toHaveAttribute(
      "href",
      "/membership"
    );
  });

  it("renders Xem phim section with movie links", () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    expect(screen.getByText("Xem phim")).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /phim đang chiếu/i })
    ).toHaveAttribute("href", "/movie/moviesShowing");
    expect(
      screen.getByRole("link", { name: /phim sắp chiếu/i })
    ).toHaveAttribute("href", "/movie/moviesUpComming");
    expect(
      screen.getByRole("link", { name: /suất chiếu đặc biệt/i })
    ).toHaveAttribute("href", "/movie/movies");
  });

  it("renders Hệ thống rạp section with cinema locations", () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    expect(screen.getByText("Hệ thống rạp")).toBeInTheDocument();
    expect(
      screen.getByText(/CinesVerse Tran Quoc\(Hà Nội\)/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/CinesVerse Tran Quoc1\(TP.HCM\)/i)
    ).toBeInTheDocument();
  });

  it("renders social media icons", () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    const socialLinks = screen.getAllByRole("link", {
      name: /facebook|youtube|tiktok/i,
    });
    expect(socialLinks.length).toBeGreaterThanOrEqual(3);
  });

  it("renders copyright text", () => {
    render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(new RegExp(`${currentYear}.*CinesVerse`, "i"))
    ).toBeInTheDocument();
  });

  it("has gradient background styling", () => {
    const { container } = render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    const footer = container.querySelector("footer");
    expect(footer).toHaveClass("bg-gradient-to-r");
    expect(footer).toHaveClass("from-[#070016]");
  });

  it("renders glow effect divs", () => {
    const { container } = render(
      <BrowserRouter>
        <Footer />
      </BrowserRouter>
    );

    const glowContainer = container.querySelector(
      ".pointer-events-none.absolute.inset-0"
    );
    expect(glowContainer).toBeInTheDocument();
  });
});
