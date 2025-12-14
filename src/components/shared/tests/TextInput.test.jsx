// src/components/shared/tests/TextInput.test.jsx
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TextInput from "../TextInput";

describe("TextInput", () => {
  it("renders input with label", () => {
    render(
      <TextInput
        label="Email"
        name="email"
        value=""
        onChange={() => {}}
        placeholder="Enter email"
      />
    );

    expect(screen.getByLabelText("Email")).toBeInTheDocument();
    expect(screen.getByPlaceholderText("Enter email")).toBeInTheDocument();
  });

  it("renders without label when label is not provided", () => {
    render(
      <TextInput
        name="email"
        value=""
        onChange={() => {}}
        placeholder="Email"
      />
    );

    expect(screen.queryByLabelText("Email")).not.toBeInTheDocument();
    expect(screen.getByPlaceholderText("Email")).toBeInTheDocument();
  });

  it("calls onChange when user types", async () => {
    const user = userEvent.setup();
    const handleChange = vi.fn();

    render(
      <TextInput
        name="username"
        value=""
        onChange={handleChange}
        placeholder="Username"
      />
    );

    const input = screen.getByPlaceholderText("Username");
    await user.type(input, "test");

    expect(handleChange).toHaveBeenCalled();
    expect(handleChange).toHaveBeenCalledTimes(4); // 't', 'e', 's', 't'
  });

  it("displays error message when error prop is provided", () => {
    render(
      <TextInput
        name="email"
        value=""
        onChange={() => {}}
        error="Email is required"
      />
    );

    expect(screen.getByText("Email is required")).toBeInTheDocument();
  });

  it("applies error border styling when error exists", () => {
    const { container } = render(
      <TextInput
        name="email"
        value=""
        onChange={() => {}}
        error="Invalid email"
      />
    );

    const wrapper = container.querySelector(".border-red-500\\/70");
    expect(wrapper).toBeInTheDocument();
  });

  it("applies normal border when no error", () => {
    const { container } = render(
      <TextInput name="email" value="" onChange={() => {}} />
    );

    const wrapper = container.querySelector(".border-white\\/15");
    expect(wrapper).toBeInTheDocument();
  });

  it("renders with icon when icon prop is provided", () => {
    const icon = <span data-testid="test-icon">📧</span>;

    render(<TextInput name="email" value="" onChange={() => {}} icon={icon} />);

    expect(screen.getByTestId("test-icon")).toBeInTheDocument();
  });

  it("renders password toggle button when showPasswordToggle is true", () => {
    render(
      <TextInput
        name="password"
        type="password"
        value=""
        onChange={() => {}}
        showPasswordToggle={true}
        showPassword={false}
        onTogglePassword={() => {}}
      />
    );

    expect(screen.getByRole("button", { name: /hiện/i })).toBeInTheDocument();
  });

  it("toggles password visibility when toggle button is clicked", async () => {
    const user = userEvent.setup();
    const handleToggle = vi.fn();

    render(
      <TextInput
        name="password"
        type="password"
        value=""
        onChange={() => {}}
        showPasswordToggle={true}
        showPassword={false}
        onTogglePassword={handleToggle}
      />
    );

    const toggleBtn = screen.getByRole("button", { name: /hiện/i });
    await user.click(toggleBtn);

    expect(handleToggle).toHaveBeenCalledTimes(1);
  });

  it("shows 'Ẩn' text when password is visible", () => {
    render(
      <TextInput
        name="password"
        type="text"
        value=""
        onChange={() => {}}
        showPasswordToggle={true}
        showPassword={true}
        onTogglePassword={() => {}}
      />
    );

    expect(screen.getByRole("button", { name: /ẩn/i })).toBeInTheDocument();
  });

  it("uses correct input type based on type prop", () => {
    const { rerender } = render(
      <TextInput
        name="email"
        type="email"
        value=""
        onChange={() => {}}
        placeholder="Email"
      />
    );

    let input = screen.getByPlaceholderText("Email");
    expect(input).toHaveAttribute("type", "email");

    rerender(
      <TextInput
        name="password"
        type="password"
        value=""
        onChange={() => {}}
        placeholder="Password"
      />
    );

    input = screen.getByPlaceholderText("Password");
    expect(input).toHaveAttribute("type", "password");
  });

  it("defaults to type='text' when type prop is not provided", () => {
    render(
      <TextInput
        name="username"
        value=""
        onChange={() => {}}
        placeholder="Username"
      />
    );

    const input = screen.getByPlaceholderText("Username");
    expect(input).toHaveAttribute("type", "text");
  });

  it("renders with controlled value", () => {
    const { rerender } = render(
      <TextInput name="username" value="initial" onChange={() => {}} />
    );

    let input = screen.getByDisplayValue("initial");
    expect(input).toHaveValue("initial");

    rerender(<TextInput name="username" value="updated" onChange={() => {}} />);

    input = screen.getByDisplayValue("updated");
    expect(input).toHaveValue("updated");
  });
});
