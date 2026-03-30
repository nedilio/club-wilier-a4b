// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MembershipCard } from "@/components/card/membership-card";

vi.mock("next/image", () => ({
  default: ({
    src,
    alt,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & { src: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

const baseProps = {
  firstName: "Ana",
  lastName: "González",
  rut: "12345678k",
  clubWilierNumber: null,
};

describe("MembershipCard", () => {
  it("renders the user's full name", () => {
    render(<MembershipCard {...baseProps} />);
    expect(screen.getByText(/Ana/i)).toBeInTheDocument();
    expect(screen.getByText(/González/i)).toBeInTheDocument();
  });

  it("renders the formatted RUT", () => {
    render(<MembershipCard {...baseProps} />);
    expect(screen.getByText("12.345.678-K")).toBeInTheDocument();
  });

  describe("when user is a Club Wilier member", () => {
    it("shows the membership number", () => {
      render(<MembershipCard {...baseProps} clubWilierNumber="42" />);
      expect(screen.getByText(/#42/i)).toBeInTheDocument();
    });

    it("shows 'Socio' label", () => {
      render(<MembershipCard {...baseProps} clubWilierNumber="42" />);
      expect(screen.getByText(/socio/i)).toBeInTheDocument();
    });
  });

  describe("when user is not a member", () => {
    it("shows the membership request message", () => {
      render(<MembershipCard {...baseProps} clubWilierNumber={null} />);
      expect(screen.getByText(/solicita tu membresía/i)).toBeInTheDocument();
    });
  });
});
