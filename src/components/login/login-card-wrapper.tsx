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
    <div className={cn("glass rounded-2xl p-8", className)}>
      {children}
    </div>
  );
}
