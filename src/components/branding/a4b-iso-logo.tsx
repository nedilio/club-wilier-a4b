import Image from "next/image";
import { cn } from "@/lib/utils";
import { A4B_ISO_LOGO_SRC } from "@/lib/brand";

interface A4bIsoLogoProps {
  alt?: string;
  className?: string;
  size?: "xs" | "sm" | "md" | "lg";
}

const sizeClasses = {
  xs: "size-8",
  sm: "size-10",
  md: "size-12",
  lg: "size-16",
};

export function A4bIsoLogo({
  alt = "All4Bikers logo",
  className,
  size = "md",
}: A4bIsoLogoProps) {
  return (
    <div className={cn("relative shrink-0", sizeClasses[size], className)}>
      <Image
        src={A4B_ISO_LOGO_SRC}
        alt={alt}
        fill
        sizes="(max-width: 768px) 64px, 64px"
        className="object-contain"
      />
    </div>
  );
}
