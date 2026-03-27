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
        "min-h-svh w-full flex flex-col items-center justify-center p-6 relative overflow-hidden",
        className
      )}
      style={{
        background: `
          linear-gradient(135deg, #121c2b 0%, #1e2f42 50%, #121c2b 100%)
        `,
      }}
    >
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      <div
        className="absolute -top-40 -right-40 w-80 h-80 rounded-full opacity-20 blur-3xl"
        style={{ background: "linear-gradient(135deg, #1e2f42, #121c2b)" }}
      />
      <div
        className="absolute -bottom-40 -left-40 w-80 h-80 rounded-full opacity-20 blur-3xl"
        style={{ background: "linear-gradient(135deg, #1e2f42, #121c2b)" }}
      />
      <div className="relative z-10 w-full max-w-sm">{children}</div>
    </div>
  );
}
