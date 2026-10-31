"use client";

import { useEffect, useRef } from "react";

// Rounded arrow cursor path (24px viewBox), rendered at 25px and rotated 15deg clockwise.
const CURSOR_PATH =
    "M17.2607 12.4008C19.3774 11.2626 20.4357 10.6935 20.7035 10.0084C20.9359 9.41393 20.8705 8.74423 20.5276 8.20587C20.1324 7.58551 18.984 7.23176 16.6872 6.52425L8.00612 3.85014C6.06819 3.25318 5.09923 2.95471 4.45846 3.19669C3.90068 3.40733 3.46597 3.85584 3.27285 4.41993C3.051 5.06794 3.3796 6.02711 4.03681 7.94545L6.94793 16.4429C7.75632 18.8025 8.16052 19.9824 8.80519 20.3574C9.36428 20.6826 10.0461 20.7174 10.6354 20.4507C11.3149 20.1432 11.837 19.0106 12.8813 16.7454L13.6528 15.0719C13.819 14.7113 13.9021 14.531 14.0159 14.3736C14.1168 14.2338 14.2354 14.1078 14.3686 13.9984C14.5188 13.8752 14.6936 13.7812 15.0433 13.5932L17.2607 12.4008Z";

const CURSOR_SIZE = 25;
// Arrow tip offset in logical CSS pixels (25x25 space), aligned with the physical pointer position.
const HOTSPOT_X = 8;
const HOTSPOT_Y = 3;

let cachedCursorCss: string | null = null;

/**
 * Rasterizes the Workvence custom arrow once onto an offscreen canvas at the target
 * pixel density so the OS GPU Hardware Cursor Plane can render it with 0ms latency.
 */
function renderHardwareCursorDataUrl(scale: number): string {
    const pxSize = Math.round(CURSOR_SIZE * scale);

    // 1. Render crisp fill + white border onto an unshadowed shape buffer
    const shapeCanvas = document.createElement("canvas");
    shapeCanvas.width = pxSize;
    shapeCanvas.height = pxSize;
    const shapeCtx = shapeCanvas.getContext("2d");
    if (!shapeCtx) return "";

    // Match <svg width="25" height="25" viewBox="-1 -1 26 26">
    const unitScale = pxSize / 26;
    shapeCtx.scale(unitScale, unitScale);
    shapeCtx.translate(1, 1);

    // Match <g transform="rotate(15 12 12)">
    shapeCtx.translate(12, 12);
    shapeCtx.rotate((15 * Math.PI) / 180);
    shapeCtx.translate(-12, -12);

    const path = new Path2D(CURSOR_PATH);
    shapeCtx.fillStyle = "#000000";
    shapeCtx.fill(path);

    shapeCtx.strokeStyle = "#ffffff";
    shapeCtx.lineWidth = 3;
    shapeCtx.lineCap = "round";
    shapeCtx.lineJoin = "round";
    shapeCtx.stroke(path);

    // 2. Composite shape buffer with a single unified drop-shadow (matching CSS drop-shadow)
    const outCanvas = document.createElement("canvas");
    outCanvas.width = pxSize;
    outCanvas.height = pxSize;
    const outCtx = outCanvas.getContext("2d");
    if (!outCtx) return shapeCanvas.toDataURL("image/png");

    outCtx.shadowColor = "rgba(0, 0, 0, 0.25)";
    outCtx.shadowBlur = 1.2 * scale;
    outCtx.shadowOffsetX = 0;
    outCtx.shadowOffsetY = 1 * scale;
    outCtx.drawImage(shapeCanvas, 0, 0);

    return outCanvas.toDataURL("image/png");
}

function buildHardwareCursorCss(): string {
    if (cachedCursorCss) return cachedCursorCss;

    const png1x = renderHardwareCursorDataUrl(1);
    const png2x = renderHardwareCursorDataUrl(2);
    if (!png1x || !png2x) return "";

    cachedCursorCss = `
@media (pointer: fine) {
  html.has-custom-cursor,
  html.has-custom-cursor * {
    cursor: url("${png1x}") ${HOTSPOT_X} ${HOTSPOT_Y}, auto !important;
    cursor: -webkit-image-set(url("${png1x}") 1x, url("${png2x}") 2x) ${HOTSPOT_X} ${HOTSPOT_Y}, auto !important;
    cursor: image-set(url("${png1x}") 1x, url("${png2x}") 2x) ${HOTSPOT_X} ${HOTSPOT_Y}, auto !important;
  }

  html.has-custom-cursor input:not([type="button"]):not([type="submit"]):not([type="reset"]):not([type="checkbox"]):not([type="radio"]):not([type="range"]):not([type="file"]):not([type="color"]),
  html.has-custom-cursor textarea,
  html.has-custom-cursor [contenteditable="true"],
  html.has-custom-cursor .ql-editor,
  html.has-custom-cursor .cursor-text {
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
    return cachedCursorCss;
}

export const TidalWaveCursor = () => {
    const rippleRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (!window.matchMedia("(pointer: fine)").matches) return;

        const css = buildHardwareCursorCss();
        if (!css) return;

        const styleEl = document.createElement("style");
        styleEl.setAttribute("data-workvence-cursor", "hardware");
        styleEl.textContent = css;
        document.head.appendChild(styleEl);

        const root = document.documentElement;
        root.classList.add("has-custom-cursor");

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        let clickAnimation: Animation | null = null;

        const handlePointerDown = (e: PointerEvent) => {
            if (e.button !== 0 || prefersReducedMotion.matches) return;
            const ripple = rippleRef.current;
            if (!ripple) return;

            const target = e.target as Element | null;
            if (target?.closest?.(':disabled, [aria-disabled="true"], .cursor-not-allowed')) {
                return;
            }

            clickAnimation?.cancel();

            // Pure GPU compositor-thread animation (transform + opacity only)
            const x = e.clientX;
            const y = e.clientY;
            clickAnimation = ripple.animate(
                [
                    {
                        transform: `translate3d(${x}px, ${y}px, 0) scale(0.35)`,
                        opacity: 0.95,
                    },
                    {
                        transform: `translate3d(${x}px, ${y}px, 0) scale(1.35)`,
                        opacity: 0,
                    },
                ],
                {
                    duration: 420,
                    easing: "cubic-bezier(0.16, 1, 0.3, 1)",
                    fill: "forwards",
                }
            );
        };

        window.addEventListener("pointerdown", handlePointerDown, { passive: true });

        return () => {
            window.removeEventListener("pointerdown", handlePointerDown);
            clickAnimation?.cancel();
            root.classList.remove("has-custom-cursor");
            styleEl.remove();
        };
    }, []);

    return (
        <div
            ref={rippleRef}
            aria-hidden="true"
            className="pointer-events-none fixed will-change-transform"
            style={{
                left: -14,
                top: -14,
                width: 28,
                height: 28,
                zIndex: 2147483647,
                opacity: 0,
                contain: "layout style paint",
                transform: "translate3d(-100px, -100px, 0) scale(0.35)",
            }}
        >
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
                <defs>
                    <linearGradient
                        id="tidal-cursor-gradient"
                        x1="0"
                        y1="0"
                        x2="1"
                        y2="1"
                    >
                        <stop offset="0" stopColor="#9AFFDA" />
                        <stop offset="0.5" stopColor="#82C2FD" />
                        <stop offset="1" stopColor="#F29EFF" />
                    </linearGradient>
                </defs>
                <circle
                    cx="14"
                    cy="14"
                    r="10.5"
                    stroke="url(#tidal-cursor-gradient)"
                    strokeWidth="2.25"
                />
            </svg>
        </div>
    );
};
