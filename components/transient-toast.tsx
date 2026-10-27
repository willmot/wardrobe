"use client";

import { useEffect, useRef, useState } from "react";

export const TOAST_EXIT_DURATION_MS = 160;

export function beginToastDismiss(
  onDismiss: () => void,
  schedule: (callback: () => void, delay: number) => number = window.setTimeout,
) {
  schedule(onDismiss, TOAST_EXIT_DURATION_MS);
  return true;
}

export function TransientToast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  const [closing, setClosing] = useState(false);
  const closeTimer = useRef<number | null>(null);

  useEffect(() => () => {
    if (closeTimer.current !== null) window.clearTimeout(closeTimer.current);
  }, []);

  function dismiss() {
    if (closing) return;
    setClosing(beginToastDismiss(onDismiss, (callback, delay) => {
      closeTimer.current = window.setTimeout(callback, delay);
      return closeTimer.current;
    }));
  }

  return (
    <div className={`toast${closing ? " is-closing" : ""}`} role="status">
      {message}
      <button className="button button-quiet" type="button" onClick={dismiss}>Dismiss</button>
    </div>
  );
}
