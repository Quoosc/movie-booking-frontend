// src/components/shared/tests/LoadingIcon.test.jsx
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import LoadingIcon from "../LoadingIcon";

describe("LoadingIcon", () => {
  it("renders loading icon with spinner SVG", () => {
    render(<LoadingIcon text="Loading..." />);

    const svg = document.querySelector("svg");
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass("animate-spin");
  });

  it("displays provided text", () => {
    render(<LoadingIcon text="Please wait..." />);

    expect(screen.getByText("Please wait...")).toBeInTheDocument();
  });

  it("renders with default styling classes", () => {
    const { container } = render(<LoadingIcon text="Loading" />);

    const wrapper = container.firstChild;
    expect(wrapper).toHaveClass("flex");
    expect(wrapper).toHaveClass("items-center");
    expect(wrapper).toHaveClass("justify-center");
    expect(wrapper).toHaveClass("gap-2");
    expect(wrapper).toHaveClass("text-[#FFD700]");
  });

  it("renders without text if not provided", () => {
    const { container } = render(<LoadingIcon />);

    const span = container.querySelector("span");
    expect(span).toBeInTheDocument();
    expect(span).toHaveTextContent("");
  });

  it("renders spinner with correct SVG attributes", () => {
    render(<LoadingIcon text="Test" />);

    const svg = document.querySelector("svg");
    expect(svg).toHaveAttribute("viewBox", "0 0 24 24");
    expect(svg).toHaveAttribute("fill", "none");

    const circle = svg?.querySelector("circle");
    expect(circle).toBeInTheDocument();
    expect(circle).toHaveAttribute("cx", "12");
    expect(circle).toHaveAttribute("cy", "12");
    expect(circle).toHaveAttribute("r", "10");

    const path = svg?.querySelector("path");
    expect(path).toBeInTheDocument();
    expect(path).toHaveClass("opacity-75");
  });

  it("applies correct text styling", () => {
    const { container } = render(<LoadingIcon text="Loading data..." />);

    const span = screen.getByText("Loading data...");
    expect(span).toHaveClass("text-sm");
    expect(span).toHaveClass("font-medium");
    expect(span).toHaveClass("tracking-wide");
  });

  it("renders multiple instances independently", () => {
    const { rerender } = render(<LoadingIcon text="First" />);
    expect(screen.getByText("First")).toBeInTheDocument();

    rerender(<LoadingIcon text="Second" />);
    expect(screen.getByText("Second")).toBeInTheDocument();
    expect(screen.queryByText("First")).not.toBeInTheDocument();
  });
});
