"use client";

import { useEffect, useRef } from "react";

// Rounded arrow cursor path (24px viewBox), rendered at 28px and rotated 15deg clockwise.
const CURSOR_PATH =
    "M17.2607 12.4008C19.3774 11.2626 20.4357 10.6935 20.7035 10.0084C20.9359 9.41393 20.8705 8.74423 20.5276 8.20587C20.1324 7.58551 18.984 7.23176 16.6872 6.52425L8.00612 3.85014C6.06819 3.25318 5.09923 2.95471 4.45846 3.19669C3.90068 3.40733 3.46597 3.85584 3.27285 4.41993C3.051 5.06794 3.3796 6.02711 4.03681 7.94545L6.94793 16.4429C7.75632 18.8025 8.16052 19.9824 8.80519 20.3574C9.36428 20.6826 10.0461 20.7174 10.6354 20.4507C11.3149 20.1432 11.837 19.0106 12.8813 16.7454L13.6528 15.0719C13.819 14.7113 13.9021 14.531 14.0159 14.3736C14.1168 14.2338 14.2354 14.1078 14.3686 13.9984C14.5188 13.8752 14.6936 13.7812 15.0433 13.5932L17.2607 12.4008Z";

// Arrow tip offset inside the 28px SVG, used to align the tip with the real pointer position.
const HOTSPOT_X = 8;
const HOTSPOT_Y = 3;

// Hide the native cursor universally on all elements (including links, buttons, and children)
// so the native pointer hand never peeks through or overlays the custom cursor.
// Text inputs and disabled controls retain their native specialized cursors.
const CURSOR_CSS = `
@media (pointer: fine) {
  html.has-custom-cursor,
  html.has-custom-cursor *,
  html.has-custom-cursor *::before,
  html.has-custom-cursor *::after {
    cursor: none !important;
  }

  html.has-custom-cursor input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]),
  html.has-custom-cursor textarea,
  html.has-custom-cursor [contenteditable="true"] {
    cursor: text !important;
  }

  html.has-custom-cursor :disabled,
  html.has-custom-cursor [aria-disabled="true"],
  html.has-custom-cursor .cursor-not-allowed {
    cursor: not-allowed !important;
  }

  html.has-custom-cursor .cursor-grab {
    cursor: grab !important;
  }

  html.has-custom-cursor .cursor-grabbing {
    cursor: grabbing !important;
  }
}
`;

export const TidalWaveCursor = () => {
    const cursorRef = useRef<HTMLDivElement | null>(null);
    const traceRef = useRef<SVGPathElement | null>(null);

    useEffect(() => {
        if (!window.matchMedia("(pointer: fine)").matches) return;

        const cursor = cursorRef.current;
        const trace = traceRef.current;
        if (!cursor || !trace) return;

        const root = document.documentElement;
        root.classList.add("has-custom-cursor");

        let visible = false;
        let lastTarget: Element | null = null;
        let clickAnimation: Animation | null = null;

        const setVisible = (next: boolean) => {
            if (next === visible) return;
            visible = next;
            cursor.style.opacity = next ? "1" : "0";
        };

        const shouldShowCustomCursor = (target: Element | null): boolean => {
            if (!target) return false;

            // Allow native cursor for text selection, inputs, and textareas
            if (
                target.closest(
                    'input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]), textarea, [contenteditable="true"]'
                )
            ) {
                return false;
            }

            // Allow native cursor for disabled states
            if (target.closest(':disabled, [aria-disabled="true"], .cursor-not-allowed')) {
                return false;
            }

            // Allow native cursor for grab interactions
            if (target.closest('.cursor-grab, .cursor-grabbing')) {
                return false;
            }

            return true;
        };

        const handleMove = (e: MouseEvent) => {
            // Instant 1:1 zero-latency position tracking
            cursor.style.transform = `translate3d(${e.clientX - HOTSPOT_X}px, ${e.clientY - HOTSPOT_Y}px, 0)`;

            const target = e.target as Element | null;
            if (target !== lastTarget) {
                lastTarget = target;
                setVisible(shouldShowCustomCursor(target));
            } else if (!visible) {
                setVisible(shouldShowCustomCursor(target));
            }
        };

        const handleDown = () => {
            clickAnimation?.cancel();

            // pathLength is normalised to 100: the gradient stroke is drawn from the
            // start of the outline to its end, then erased from the start to the end.
            clickAnimation = trace.animate(
                [
                    { strokeDashoffset: 101, opacity: 1, easing: "ease-out" },
                    { strokeDashoffset: 0, opacity: 1, easing: "ease-in", offset: 0.5 },
                    { strokeDashoffset: -101, opacity: 1 },
                ],
                { duration: 800 }
            );
        };

        const handleLeave = () => {
            setVisible(false);
            lastTarget = null;
        };

        const handleEnter = () => {
            setVisible(true);
        };

        window.addEventListener("mousemove", handleMove, { passive: true });
        window.addEventListener("mousedown", handleDown, { passive: true });
        root.addEventListener("mouseleave", handleLeave);
        root.addEventListener("mouseenter", handleEnter);

        return () => {
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mousedown", handleDown);
            root.removeEventListener("mouseleave", handleLeave);
            root.removeEventListener("mouseenter", handleEnter);
            clickAnimation?.cancel();
            root.classList.remove("has-custom-cursor");
        };
    }, []);

    return (
        <>
            <style>{CURSOR_CSS}</style>
            <div
                ref={cursorRef}
                aria-hidden="true"
                className="pointer-events-none fixed left-0 top-0 will-change-transform"
                style={{
                    zIndex: 2147483647,
                    opacity: 0,
                    transform: "translate3d(-100px, -100px, 0)",
                    filter: "drop-shadow(0 1px 1px rgba(0, 0, 0, 0.25))",
                }}
            >
                <svg width="25" height="25" viewBox="-1 -1 26 26" fill="none">
                    <defs>
                        <linearGradient
                            id="tidal-cursor-gradient"
                            x1="0"
                            y1="0"
                            x2="1"
                            y2="0"
                        >
                            <stop offset="0" stopColor="#9AFFDA" />
                            <stop offset="0.5" stopColor="#82C2FD" />
                            <stop offset="1" stopColor="#F29EFF" />
                        </linearGradient>
                    </defs>
                    <g transform="rotate(15 12 12)">
                        {/* Base arrow: black fill with a white border */}
                        <path
                            d={CURSOR_PATH}
                            fill="#000"
                            stroke="#fff"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                        {/* Gradient border: hidden until a click sweeps it along the outline */}
                        <path
                            ref={traceRef}
                            d={CURSOR_PATH}
                            fill="none"
                            stroke="url(#tidal-cursor-gradient)"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            pathLength={100}
                            strokeDasharray="100 200"
                            strokeDashoffset={101}
                            style={{ opacity: 0 }}
                        />
                    </g>
                </svg>
            </div>
        </>
    );
};
