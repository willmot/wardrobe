"use client";

import { X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";

import { ItemDetailView } from "@/components/item-detail-view";
import type { WardrobeItem } from "@/lib/types";

export function ItemDetailDrawer({ initialItem, wardrobe, activeOwnerId }: { initialItem: WardrobeItem; wardrobe: WardrobeItem[]; activeOwnerId: string }) {
  const router = useRouter();
  const closeButton = useRef<HTMLButtonElement>(null);
  const closingRef = useRef(false);
  const [closing, setClosing] = useState(false);

  const close = useCallback(() => {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    window.setTimeout(() => router.back(), 220);
  }, [router]);

  useEffect(() => {
    document.body.classList.add("detail-drawer-open");
    closeButton.current?.focus({ preventScroll: true });
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") close();
    };
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.classList.remove("detail-drawer-open");
      document.removeEventListener("keydown", onKeyDown);
      window.setTimeout(() => document.querySelector<HTMLElement>(`a[href="/wardrobe/${initialItem.id}"]`)?.focus({ preventScroll: true }), 0);
    };
  }, [close, initialItem.id]);

  return (
    <div className={`detail-drawer-layer${closing ? " is-closing" : ""}`} role="presentation" onPointerDown={(event) => event.target === event.currentTarget && close()}>
      <aside className="detail-drawer" role="dialog" aria-modal="true" aria-label={`${initialItem.name} details`}>
        <button ref={closeButton} className="detail-drawer-close" type="button" onClick={close} aria-label="Close item details"><X size={22} /></button>
        <ItemDetailView initialItem={initialItem} wardrobe={wardrobe} activeOwnerId={activeOwnerId} variant="drawer" />
      </aside>
    </div>
  );
}
