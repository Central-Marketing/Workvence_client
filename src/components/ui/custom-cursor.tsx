"use client";

import { useEffect } from "react";

// Rounded arrow cursor path (24px viewBox), rendered at 25px and rotated 15deg clockwise.
const CURSOR_PATH =
    "M17.2607 12.4008C19.3774 11.2626 20.4357 10.6935 20.7035 10.0084C20.9359 9.41393 20.8705 8.74423 20.5276 8.20587C20.1324 7.58551 18.984 7.23176 16.6872 6.52425L8.00612 3.85014C6.06819 3.25318 5.09923 2.95471 4.45846 3.19669C3.90068 3.40733 3.46597 3.85584 3.27285 4.41993C3.051 5.06794 3.3796 6.02711 4.03681 7.94545L6.94793 16.4429C7.75632 18.8025 8.16052 19.9824 8.80519 20.3574C9.36428 20.6826 10.0461 20.7174 10.6354 20.4507C11.3149 20.1432 11.837 19.0106 12.8813 16.7454L13.6528 15.0719C13.819 14.7113 13.9021 14.531 14.0159 14.3736C14.1168 14.2338 14.2354 14.1078 14.3686 13.9984C14.5188 13.8752 14.6936 13.7812 15.0433 13.5932L17.2607 12.4008Z";

const CURSOR_SIZE = 25;
// Arrow tip offset in logical CSS pixels (25x25 space), aligned with the physical pointer position.
const HOTSPOT_X = 8;
const HOTSPOT_Y = 3;

const CLICK_DURATION_MS = 800;
const BEAM_FRAME_COUNT = 22;

const NON_TEXT_INPUT_TYPES = new Set([
    "button",
    "submit",
    "reset",
    "checkbox",
    "radio",
    "range",
    "file",
    "color",
]);

let cachedIdleCss: string | null = null;
let cachedFramesCss: string | null = null;
// Keep decoded HTMLImageElement instances pinned in memory so Blink's MemoryCache
// never evicts or re-decodes the OS cursor frames during click playback.
const pinnedCursorImages: HTMLImageElement[] = [];

function pinImageInCache(dataUrl: string) {
    if (!dataUrl || typeof Image === "undefined") return;
    const img = new Image();
    img.src = dataUrl;
    img.decode?.().catch(() => {});
    pinnedCursorImages.push(img);
}

function getCursorPathTotalLength(): number {
    if (typeof document === "undefined") return 54.6;
    try {
        const svgPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
        svgPath.setAttribute("d", CURSOR_PATH);
        const len = svgPath.getTotalLength();
        return len > 0 ? len : 54.6;
    } catch {
        return 54.6;
    }
}

/**
 * Renders a single OS hardware cursor bitmap (either idle or at normalized border-beam
 * dash offset `normDashOffset` along `CURSOR_PATH`) at `1x` or `2x` HiDPI scale.
 */
function renderCursorFrameDataUrl(
    scale: number,
    normDashOffset: number | null,
    totalPathLen: number
): string {
    const pxSize = Math.round(CURSOR_SIZE * scale);

    // 1. Draw crisp black body + white border (+ optional border-beam sweep) on unshadowed buffer
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

    // Overlay the exact #9AFFDA -> #82C2FD -> #F29EFF border-beam sweep on top of the white border
    if (normDashOffset !== null) {
        const grad = shapeCtx.createLinearGradient(3.1, 0, 20.9, 0);
        grad.addColorStop(0, "#9AFFDA");
        grad.addColorStop(0.5, "#82C2FD");
        grad.addColorStop(1, "#F29EFF");

        shapeCtx.strokeStyle = grad;
        shapeCtx.lineWidth = 3;
        shapeCtx.lineCap = "round";
        shapeCtx.lineJoin = "round";
        shapeCtx.setLineDash([totalPathLen, totalPathLen * 2]);
        shapeCtx.lineDashOffset = (normDashOffset / 100) * totalPathLen;
        shapeCtx.stroke(path);
    }

    // 2. Composite shape buffer onto output canvas with unified drop-shadow
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

    const dataUrl = outCanvas.toDataURL("image/png");
    pinImageInCache(dataUrl);
    return dataUrl;
}

function formatCursorDeclarations(png1x: string, png2x: string): string {
    return [
        `cursor: url("${png1x}") ${HOTSPOT_X} ${HOTSPOT_Y}, auto !important;`,
        `cursor: -webkit-image-set(url("${png1x}") 1x, url("${png2x}") 2x) ${HOTSPOT_X} ${HOTSPOT_Y}, auto !important;`,
        `cursor: image-set(url("${png1x}") 1x, url("${png2x}") 2x) ${HOTSPOT_X} ${HOTSPOT_Y}, auto !important;`,
    ].join("\n    ");
}

const SPECIALIZED_CURSOR_OVERRIDES_CSS = `
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
`;

function buildIdleCursorCss(): string {
    if (cachedIdleCss) return cachedIdleCss;

    const totalLen = getCursorPathTotalLength();
    const idle1x = renderCursorFrameDataUrl(1, null, totalLen);
    const idle2x = renderCursorFrameDataUrl(2, null, totalLen);
    if (!idle1x || !idle2x) return "";

    cachedIdleCss = `
@media (pointer: fine) {
  html.has-custom-cursor,
  html.has-custom-cursor * {
    ${formatCursorDeclarations(idle1x, idle2x)}
  }
${SPECIALIZED_CURSOR_OVERRIDES_CSS}
}
`;
    return cachedIdleCss;
}

function buildAnimatedFramesCss(): string {
    if (cachedFramesCss) return cachedFramesCss;

    const totalLen = getCursorPathTotalLength();
    const frameRules: string[] = [];

    for (let i = 0; i < BEAM_FRAME_COUNT; i++) {
        const t = (i + 1) / (BEAM_FRAME_COUNT + 1);
        let normOffset: number;

        // Match original keyframes: 101 -> 0 (ease-out to 50%), then 0 -> -101 (ease-in to 100%)
        if (t <= 0.5) {
            const u = t / 0.5;
            const eased = 1 - (1 - u) * (1 - u);
            normOffset = 104 * (1 - eased);
        } else {
            const u = (t - 0.5) / 0.5;
            const eased = u * u;
            normOffset = -104 * eased;
        }

        const f1x = renderCursorFrameDataUrl(1, normOffset, totalLen);
        const f2x = renderCursorFrameDataUrl(2, normOffset, totalLen);
        if (!f1x || !f2x) continue;

        // :where() keeps specificity identical to html.has-custom-cursor * so specialized
        // overrides (text, not-allowed, grab) always take precedence automatically.
        frameRules.push(`
  html.has-custom-cursor:where([data-cursor-frame="${i}"]),
  html.has-custom-cursor:where([data-cursor-frame="${i}"]) * {
    ${formatCursorDeclarations(f1x, f2x)}
  }`);
    }

    cachedFramesCss = `
@media (pointer: fine) {
${frameRules.join("\n")}
${SPECIALIZED_CURSOR_OVERRIDES_CSS}
}
`;
    return cachedFramesCss;
}

function isArrowCursorTarget(target: Element | null): boolean {
    let el: Element | null = target;
    while (el) {
        if ((el as HTMLElement).isContentEditable) return false;

        const tag = el.tagName;
        if (tag === "TEXTAREA") return false;
        if (tag === "INPUT") {
            const input = el as HTMLInputElement;
            if (input.disabled) return false;
            const type = (input.type || "text").toLowerCase();
            if (!NON_TEXT_INPUT_TYPES.has(type)) return false;
        }

        if ((el as HTMLButtonElement).disabled || el.getAttribute("aria-disabled") === "true") {
            return false;
        }

        const cls = el.classList;
        if (
            cls.length > 0 &&
            (cls.contains("cursor-not-allowed") ||
                cls.contains("cursor-text") ||
                cls.contains("cursor-grab") ||
                cls.contains("cursor-grabbing") ||
                cls.contains("ql-editor"))
        ) {
            return false;
        }

        el = el.parentElement;
    }
    return true;
}

export const TidalWaveCursor = () => {
    useEffect(() => {
        if (!window.matchMedia("(pointer: fine)").matches) return;

        const idleCss = buildIdleCursorCss();
        if (!idleCss) return;

        const idleStyleEl = document.createElement("style");
        idleStyleEl.setAttribute("data-workvence-cursor", "hardware-idle");
        idleStyleEl.textContent = idleCss;
        document.head.appendChild(idleStyleEl);

        const framesStyleEl = document.createElement("style");
        framesStyleEl.setAttribute("data-workvence-cursor", "hardware-frames");
        document.head.appendChild(framesStyleEl);

        const root = document.documentElement;
        root.classList.add("has-custom-cursor");

        let framesReady = false;
        const ensureFramesBuilt = () => {
            if (framesReady) return;
            framesReady = true;
            framesStyleEl.textContent = buildAnimatedFramesCss();
        };

        // Pre-warm the 22 OS-level border-beam cursor frames during browser idle time
        let idleCallbackId: number | null = null;
        let fallbackTimerId: ReturnType<typeof setTimeout> | null = null;
        if ("requestIdleCallback" in window) {
            idleCallbackId = window.requestIdleCallback(ensureFramesBuilt, { timeout: 500 });
        } else {
            fallbackTimerId = setTimeout(ensureFramesBuilt, 32);
        }

        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
        let rafId = 0;
        let lastFrameIdx = -1;

        const stopAnimation = () => {
            if (rafId) {
                cancelAnimationFrame(rafId);
                rafId = 0;
            }
            if (lastFrameIdx !== -1) {
                lastFrameIdx = -1;
                root.removeAttribute("data-cursor-frame");
            }
        };

        const handlePointerDown = (e: PointerEvent) => {
            if (e.button !== 0 || prefersReducedMotion.matches) return;
            if (!isArrowCursorTarget(e.target as Element | null)) return;

            ensureFramesBuilt();
            stopAnimation();

            const startTime = performance.now();

            const step = (now: number) => {
                const elapsed = now - startTime;
                if (elapsed >= CLICK_DURATION_MS) {
                    stopAnimation();
                    return;
                }

                const frameIdx = Math.min(
                    BEAM_FRAME_COUNT - 1,
                    Math.floor((elapsed / CLICK_DURATION_MS) * BEAM_FRAME_COUNT)
                );

                if (frameIdx !== lastFrameIdx) {
                    lastFrameIdx = frameIdx;
                    root.setAttribute("data-cursor-frame", String(frameIdx));
                }

                rafId = requestAnimationFrame(step);
            };

            // Show frame 0 immediately on click
            lastFrameIdx = 0;
            root.setAttribute("data-cursor-frame", "0");
            rafId = requestAnimationFrame(step);
        };

        window.addEventListener("pointerdown", handlePointerDown, { passive: true });

        return () => {
            window.removeEventListener("pointerdown", handlePointerDown);
            stopAnimation();
            if (idleCallbackId !== null && "cancelIdleCallback" in window) {
                window.cancelIdleCallback(idleCallbackId);
            }
            if (fallbackTimerId !== null) {
                clearTimeout(fallbackTimerId);
            }
            root.classList.remove("has-custom-cursor");
            idleStyleEl.remove();
            framesStyleEl.remove();
        };
    }, []);

    // Pure OS-level hardware cursor — zero DOM follower elements!
    return null;
};
