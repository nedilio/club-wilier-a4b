import { cn } from "@/lib/utils";

export function LoginContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "min-h-svh w-full flex flex-col items-center justify-center p-6 relative",
        className,
      )}
    >
      <div className="relative z-10 w-full max-w-sm">{children}</div>
    </div>
  );
}
