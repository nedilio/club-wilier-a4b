"use client";

import { useState } from "react";
import { BellIcon, Clock3Icon } from "lucide-react";

export interface NotificationHistoryItem {
  id: number;
  label: string;
  message: string;
  sentAtIso: string;
  sentAtLabel: string;
}

const PAGE_SIZE = 5;

export function NotificationsHistory({
  items,
}: {
  items: NotificationHistoryItem[];
}) {
  const [visible, setVisible] = useState(PAGE_SIZE);

  return (
    <div>
      <ul className="divide-y divide-white/10 border-y border-white/10">
        {items.slice(0, visible).map((item) => (
          <li
            key={item.id}
            className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:gap-6"
          >
            <div className="flex min-w-0 flex-1 items-start gap-4">
              <div className="glass-field flex size-11 shrink-0 items-center justify-center rounded-xl text-white/70">
                <BellIcon className="size-5" />
              </div>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-sm text-white/60">{item.label}</span>
                  <span className="rounded-full border border-emerald-400/25 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-300">
                    Enviado
                  </span>
                </div>
                <p className="mt-1 text-base leading-7 break-words text-white">
                  {item.message}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 pl-15 text-sm text-white/55 sm:shrink-0 sm:pl-0">
              <Clock3Icon className="size-4" />
              <time dateTime={item.sentAtIso}>{item.sentAtLabel}</time>
            </div>
          </li>
        ))}
      </ul>

      {visible < items.length && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            onClick={() => setVisible((v) => v + PAGE_SIZE)}
            className="h-11 rounded-xl px-6 text-sm font-medium text-white/80 transition-colors hover:bg-white/5 hover:text-white focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-white/30"
          >
            Cargar más
          </button>
        </div>
      )}
    </div>
  );
}
