import { afterEach, describe, expect, it, vi } from "vitest";

import { beginToastDismiss, TOAST_EXIT_DURATION_MS } from "../components/transient-toast";

afterEach(() => {
  vi.useRealTimers();
});

describe("TransientToast", () => {
  it("holds the toast in its closing state until the exit transition completes", async () => {
    vi.useFakeTimers();
    const onDismiss = vi.fn();
    const closing = beginToastDismiss(onDismiss, (callback, delay) => Number(setTimeout(callback, delay)));

    expect(closing).toBe(true);
    expect(onDismiss).not.toHaveBeenCalled();

    vi.advanceTimersByTime(TOAST_EXIT_DURATION_MS - 1);
    expect(onDismiss).not.toHaveBeenCalled();

    vi.advanceTimersByTime(1);
    expect(onDismiss).toHaveBeenCalledOnce();
  });
});
