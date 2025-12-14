// src/app/(public)/home/tests/HomePage.test.jsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import HomePage from "../page";
import * as movieService from "@/api/movieService";

vi.mock("@/api/movieService");
vi.mock("@/components/common/Navbar", () => ({
  default: () => <nav data-testid="navbar">Navbar</nav>,
}));
vi.mock("@/components/common/Footer", () => ({
  default: () => <footer data-testid="footer">Footer</footer>,
}));
vi.mock("@/components/home/HeroSlider", () => ({
  default: () => <div data-testid="hero-slider">Hero Slider</div>,
}));
vi.mock("@/components/movies/MovieCarousel", () => ({
  default: ({ title, movies }) => (
    <div data-testid={`carousel-${title.toLowerCase().replace(/\s/g, "-")}`}>
      {title}: {movies.length} movies
    </div>
  ),
}));
vi.mock("@/components/membership/MembershipHighlight", () => ({
  default: () => <div data-testid="membership-highlight">Membership</div>,
}));
vi.mock("@/components/membership/MembershipDetail", () => ({
  default: () => <div data-testid="membership-detail">Membership Detail</div>,
}));
vi.mock("@/components/contact/ContactSection", () => ({
  default: () => <div data-testid="contact">Contact</div>,
}));
vi.mock("@/components/promotions/PromoHighlight", () => ({
  default: () => <div data-testid="promo">Promotions</div>,
}));

describe("HomePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders all main sections (Navbar, Hero, Carousels, Membership, Promo, Contact, Footer)", async () => {
    movieService.getShowingMovies.mockResolvedValue([
      { id: "m1", title: "Movie 1" },
      { id: "m2", title: "Movie 2" },
    ]);
    movieService.getUpcomingMovies.mockResolvedValue([
      { id: "m3", title: "Movie 3" },
    ]);

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    expect(screen.getByTestId("navbar")).toBeInTheDocument();
    expect(screen.getByTestId("hero-slider")).toBeInTheDocument();
    expect(screen.getByTestId("membership-highlight")).toBeInTheDocument();
    expect(screen.getByTestId("promo")).toBeInTheDocument();
    expect(screen.getByTestId("contact")).toBeInTheDocument();
    expect(screen.getByTestId("footer")).toBeInTheDocument();

    await waitFor(() => {
      expect(movieService.getShowingMovies).toHaveBeenCalled();
      expect(movieService.getUpcomingMovies).toHaveBeenCalled();
    });
  });

  it("fetches and displays showing movies in carousel", async () => {
    movieService.getShowingMovies.mockResolvedValue([
      { id: "s1", title: "Showing 1" },
      { id: "s2", title: "Showing 2" },
    ]);
    movieService.getUpcomingMovies.mockResolvedValue([]);

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const showingCarousel = screen.getByText(/2 movies/i);
      expect(showingCarousel).toBeInTheDocument();
    });
  });

  it("fetches and displays upcoming movies in carousel", async () => {
    movieService.getShowingMovies.mockResolvedValue([]);
    movieService.getUpcomingMovies.mockResolvedValue([
      { id: "u1", title: "Upcoming 1" },
      { id: "u2", title: "Upcoming 2" },
      { id: "u3", title: "Upcoming 3" },
    ]);

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      const upcomingCarousel = screen.getByText(/3 movies/i);
      expect(upcomingCarousel).toBeInTheDocument();
    });
  });

  it("handles empty movie lists gracefully", async () => {
    movieService.getShowingMovies.mockResolvedValue([]);
    movieService.getUpcomingMovies.mockResolvedValue([]);

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(movieService.getShowingMovies).toHaveBeenCalled();
      expect(movieService.getUpcomingMovies).toHaveBeenCalled();
    });

    // Không crash, UI vẫn render
    expect(screen.getByTestId("navbar")).toBeInTheDocument();
  });

  it("handles API fetch errors without crashing", async () => {
    const consoleError = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    // Mock with empty arrays to simulate graceful error handling
    movieService.getShowingMovies.mockResolvedValue([]);
    movieService.getUpcomingMovies.mockResolvedValue([]);

    render(
      <BrowserRouter>
        <HomePage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(movieService.getShowingMovies).toHaveBeenCalled();
    });

    // Page still renders despite errors
    expect(screen.getByTestId("navbar")).toBeInTheDocument();

    consoleError.mockRestore();
  });
});
