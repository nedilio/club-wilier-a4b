import { cn } from "@/lib/utils";

interface LoginCardWrapperProps {
  children: React.ReactNode;
  className?: string;
}

export function LoginCardWrapper({
  children,
  className,
}: LoginCardWrapperProps) {
  return (
    <div
      className={cn(
        "rounded-2xl p-8 backdrop-blur-xl",
        "border border-white/10",
        "shadow-2xl shadow-black/20",
        "bg-white/5",
        className
      )}
      style={{
        background: "linear-gradient(135deg, rgba(30, 47, 66, 0.8) 0%, rgba(18, 28, 43, 0.9) 100%)",
      }}
    >
      {children}
    </div>
  );
}
