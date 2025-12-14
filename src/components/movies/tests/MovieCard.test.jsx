// src/components/movies/tests/MovieCard.test.jsx
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BrowserRouter } from "react-router-dom";
import MovieCard from "../MovieCard";

const mockNavigate = vi.fn();

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe("MovieCard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockMovie = {
    id: "m1",
    title: "Avengers: Endgame",
    genre: "Action, Adventure",
    minimumAge: 13,
    duration: 180,
    language: "English",
    posterUrl: "https://example.com/poster.jpg",
    trailerUrl: "https://youtube.com/trailer",
  };

  it("renders movie card with all movie information", () => {
    render(
      <BrowserRouter>
        <MovieCard m={mockMovie} />
      </BrowserRouter>
    );

    expect(screen.getByText("Avengers: Endgame")).toBeInTheDocument();
    expect(screen.getByText(/action, adventure/i)).toBeInTheDocument();
    expect(screen.getByText("T13")).toBeInTheDocument();
    expect(screen.getByText("180 phút")).toBeInTheDocument();
    expect(screen.getByText("• English")).toBeInTheDocument();

    const img = screen.getByAltText("Avengers: Endgame");
    expect(img).toHaveAttribute("src", "https://example.com/poster.jpg");
  });

  it("renders ĐẶT VÉ and TRAILER buttons", () => {
    render(
      <BrowserRouter>
        <MovieCard m={mockMovie} />
      </BrowserRouter>
    );

    expect(screen.getByRole("button", { name: /đặt vé/i })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /trailer/i })
    ).toBeInTheDocument();
  });

  it("navigates to movie detail when card is clicked", async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <MovieCard m={mockMovie} />
      </BrowserRouter>
    );

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/movie/m1");
  });

  it("navigates to movie detail when ĐẶT VÉ button is clicked", async () => {
    const user = userEvent.setup();

    render(
      <BrowserRouter>
        <MovieCard m={mockMovie} />
      </BrowserRouter>
    );

    const bookBtn = screen.getByRole("button", { name: /đặt vé/i });
    await user.click(bookBtn);

    expect(mockNavigate).toHaveBeenCalledWith("/movie/m1");
  });

  it("opens trailer in new tab when TRAILER button is clicked", async () => {
    const user = userEvent.setup();
    const windowOpenSpy = vi.spyOn(window, "open").mockImplementation(() => {});

    render(
      <BrowserRouter>
        <MovieCard m={mockMovie} />
      </BrowserRouter>
    );

    const trailerBtn = screen.getByRole("button", { name: /trailer/i });
    await user.click(trailerBtn);

    expect(windowOpenSpy).toHaveBeenCalledWith(
      "https://youtube.com/trailer",
      "_blank"
    );

    windowOpenSpy.mockRestore();
  });

  it("does not open window if trailerUrl is missing", async () => {
    const user = userEvent.setup();
    const windowOpenSpy = vi.spyOn(window, "open").mockImplementation(() => {});

    const movieNoTrailer = { ...mockMovie, trailerUrl: null };

    render(
      <BrowserRouter>
        <MovieCard m={movieNoTrailer} />
      </BrowserRouter>
    );

    const trailerBtn = screen.getByRole("button", { name: /trailer/i });
    await user.click(trailerBtn);

    expect(windowOpenSpy).not.toHaveBeenCalled();

    windowOpenSpy.mockRestore();
  });

  it("renders card without optional fields (age, duration, language)", () => {
    const minimalMovie = {
      id: "m2",
      title: "Simple Movie",
      genre: "Drama",
      posterUrl: "https://example.com/poster2.jpg",
    };

    render(
      <BrowserRouter>
        <MovieCard m={minimalMovie} />
      </BrowserRouter>
    );

    expect(screen.getByText("Simple Movie")).toBeInTheDocument();
    expect(screen.getByText(/drama/i)).toBeInTheDocument();
    expect(screen.queryByText(/T\d+/)).not.toBeInTheDocument();
    expect(screen.queryByText(/phút/)).not.toBeInTheDocument();
  });

  it("truncates long movie titles with line-clamp-2", () => {
    const longTitleMovie = {
      ...mockMovie,
      title: "A Very Long Movie Title That Should Be Truncated After Two Lines",
    };

    const { container } = render(
      <BrowserRouter>
        <MovieCard m={longTitleMovie} />
      </BrowserRouter>
    );

    const titleElement = screen.getByText(/A Very Long Movie Title/i);
    expect(titleElement).toHaveClass("line-clamp-2");
  });
});
