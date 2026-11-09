"use client";

import { useLayoutEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

/**
 * Cuadro que se estira al alto de su fila (flex items-stretch) y toma
 * ese mismo valor como ancho, quedando siempre cuadrado. `aspect-ratio`
 * no sirve aquí porque el navegador no deriva el ancho de un alto estirado.
 */
export function HeaderIconBox({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<number>();

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => setSize(Math.round(el.getBoundingClientRect().height));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={size ? { width: size } : undefined}
      className={cn(
        "flex w-11 shrink-0 items-center justify-center self-stretch",
        className,
      )}
    >
      {children}
    </div>
  );
}
