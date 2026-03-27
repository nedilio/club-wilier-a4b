import { cn } from "@/lib/utils";

interface BrandLogoProps {
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
}

export function BrandLogo({ className, size = "md" }: BrandLogoProps) {
  const sizeClasses = {
    xs: "w-8 h-10",
    sm: "w-10 h-14",
    md: "w-14 h-20",
    lg: "w-20 h-28",
  };

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 11.4 16"
      className={cn("fill-white shrink-0", sizeClasses[size], className)}
    >
      <path d="M6.6,16c0,0-0.1-1.1-0.4-3.5C6,10.1,6.7,9.4,7.3,8.6C7.9,7.9,9,7.2,9.9,7.6s0.4,2.1,0.4,2.1c2.1-1.5,0.9-4.1-1.1-4.1	c-1.9,0-3,2.7-3,2.7C6.1,4.7,7.2,3,7.2,3C5.9,1.7,5.7,0,5.7,0S5.5,1.7,4.2,3c0,0,1.1,1.7,0.9,5.2c0,0-1.1-2.7-3-2.7s-3.1,2.6-1,4.1	c0,0-0.4-1.7,0.4-2.1c0.9-0.4,2,0.3,2.6,1.1s1.3,1.5,1.1,3.9C4.9,14.9,4.8,16,4.8,16H6.6z" />
    </svg>
  );
}
