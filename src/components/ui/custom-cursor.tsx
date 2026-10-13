"use client";

import { useEffect, useRef } from "react";

type Ripple = {
    x: number;
    y: number;
    radius: number;
    alpha: number;
};

// Rounded arrow cursor path (24px viewBox), rendered at 28px and rotated 15deg clockwise.
const CURSOR_PATH =
    "M17.2607 12.4008C19.3774 11.2626 20.4357 10.6935 20.7035 10.0084C20.9359 9.41393 20.8705 8.74423 20.5276 8.20587C20.1324 7.58551 18.984 7.23176 16.6872 6.52425L8.00612 3.85014C6.06819 3.25318 5.09923 2.95471 4.45846 3.19669C3.90068 3.40733 3.46597 3.85584 3.27285 4.41993C3.051 5.06794 3.3796 6.02711 4.03681 7.94545L6.94793 16.4429C7.75632 18.8025 8.16052 19.9824 8.80519 20.3574C9.36428 20.6826 10.0461 20.7174 10.6354 20.4507C11.3149 20.1432 11.837 19.0106 12.8813 16.7454L13.6528 15.0719C13.819 14.7113 13.9021 14.531 14.0159 14.3736C14.1168 14.2338 14.2354 14.1078 14.3686 13.9984C14.5188 13.8752 14.6936 13.7812 15.0433 13.5932L17.2607 12.4008Z";

// Arrow tip offset inside the 28px SVG, used to align the tip with the real pointer position.
const HOTSPOT_X = 8;
const HOTSPOT_Y = 3;

// Hide the native cursor only while the custom cursor is mounted (html.has-custom-cursor).
// The base rule sits in @layer base so Tailwind cursor utilities (cursor-pointer, ...) still apply
// and can be detected in JS. Pointer targets (links, buttons) then get the same arrow SVG: the
// html.custom-cursor-pointer class forces their native hand cursor to `none`.
const CURSOR_CSS = `@layer base { @media (pointer: fine) { html.has-custom-cursor, html.has-custom-cursor body, html.has-custom-cursor button { cursor: none; } } } @media (pointer: fine) { html.custom-cursor-pointer, html.custom-cursor-pointer * { cursor: none !important; } }`;

export const TidalWaveCursor = () => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const cursorRef = useRef<HTMLDivElement | null>(null);
    const traceRef = useRef<SVGPathElement | null>(null);
    const ripples = useRef<Ripple[]>([]);

    // Custom arrow cursor: white border by default, gradient border sweeps on click.
    useEffect(() => {
        if (!window.matchMedia("(pointer: fine)").matches) return;

        const cursor = cursorRef.current;
        const trace = traceRef.current;
        if (!cursor || !trace) return;

        const root = document.documentElement;
        root.classList.add("has-custom-cursor");

        let visible = false;
        let lastTarget: Element | null = null;
        let targetUsesCustomCursor = false;
        let clickAnimation: Animation | null = null;

        const setVisible = (next: boolean) => {
            if (next === visible) return;
            visible = next;
            cursor.style.opacity = next ? "1" : "0";
        };

        // Decides whether the custom arrow should replace the native cursor over `target`.
        // `none` = default arrow area; `pointer` = links/buttons (the native hand is hidden via
        // html.custom-cursor-pointer). Anything else (text, not-allowed, grab, ...) stays native.
        // The override class is cleared first so the element's real cursor is read, all within one
        // synchronous task, so nothing is painted in between.
        const resolveTarget = (target: Element | null) => {
            root.classList.remove("custom-cursor-pointer");
            if (!target) return false;

            const computed = getComputedStyle(target).cursor;
            if (computed === "pointer") {
                root.classList.add("custom-cursor-pointer");
                return true;
            }
            return computed === "none";
        };

        const handleMove = (e: MouseEvent) => {
            cursor.style.transform = `translate3d(${e.clientX - HOTSPOT_X}px, ${e.clientY - HOTSPOT_Y}px, 0)`;

            const target = e.target as Element | null;
            if (target !== lastTarget) {
                lastTarget = target;
                targetUsesCustomCursor = resolveTarget(target);
            }

            setVisible(targetUsesCustomCursor);
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

        const handleLeave = () => setVisible(false);

        window.addEventListener("mousemove", handleMove, { passive: true });
        window.addEventListener("mousedown", handleDown, { passive: true });
        root.addEventListener("mouseleave", handleLeave);

        return () => {
            window.removeEventListener("mousemove", handleMove);
            window.removeEventListener("mousedown", handleDown);
            root.removeEventListener("mouseleave", handleLeave);
            clickAnimation?.cancel();
            root.classList.remove("has-custom-cursor", "custom-cursor-pointer");
        };
    }, []);

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas?.getContext("2d");

        if (!canvas || !ctx) return;

        const reducedMotion = window.matchMedia(
            "(prefers-reduced-motion: reduce)"
        );

        if (reducedMotion.matches) return;

        let animationId = 0;
        let width = 0;
        let height = 0;
        let dpr = 1;
        let lastPos: { x: number; y: number } | null = null;

        const resize = () => {
            dpr = Math.min(window.devicePixelRatio || 1, 2);
            width = window.innerWidth;
            height = window.innerHeight;

            canvas.width = Math.round(width * dpr);
            canvas.height = Math.round(height * dpr);
            canvas.style.width = `${width}px`;
            canvas.style.height = `${height}px`;

            ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        };

        // const addRipple = (x: number, y: number) => {
        //     // Limit active ripples to prevent unnecessary rendering.
        //     if (ripples.current.length >= 35) {
        //         ripples.current.shift();
        //     }

        //     ripples.current.push({
        //         x,
        //         y,
        //         radius: 2,
        //         alpha: 0.55,
        //     });
        // };

        const handleMove = (e: MouseEvent) => {
            if (!lastPos) {
                lastPos = { x: e.clientX, y: e.clientY };
                return;
            }

            const distance = Math.hypot(
                e.clientX - lastPos.x,
                e.clientY - lastPos.y
            );

            if (distance >= 22) {
                // addRipple(e.clientX, e.clientY);
                lastPos = { x: e.clientX, y: e.clientY };
            }
        };

        const animate = () => {
            ctx.clearRect(0, 0, width, height);

            ripples.current = ripples.current.filter(
                (ripple) => ripple.alpha > 0.02
            );

            for (const ripple of ripples.current) {
                const gradient = ctx.createLinearGradient(
                    ripple.x - ripple.radius,
                    ripple.y,
                    ripple.x + ripple.radius,
                    ripple.y
                );

                gradient.addColorStop(
                    0,
                    `rgba(154, 255, 218, ${ripple.alpha})`
                );

                gradient.addColorStop(
                    1,
                    `rgba(130, 194, 253, ${ripple.alpha})`
                );

                ctx.beginPath();
                ctx.arc(
                    ripple.x,
                    ripple.y,
                    ripple.radius,
                    0,
                    Math.PI * 2
                );

                ctx.strokeStyle = gradient;
                ctx.lineWidth = 1.5;
                ctx.stroke();

                ripple.radius += 1.2;
                ripple.alpha -= 0.012;
            }

            animationId = requestAnimationFrame(animate);
        };

        resize();

        window.addEventListener("resize", resize);
        window.addEventListener("mousemove", handleMove, {
            passive: true,
        });

        animate();

        return () => {
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", handleMove);
            cancelAnimationFrame(animationId);
            ripples.current = [];
        };
    }, []);

    return (
        <>
            <style>{CURSOR_CSS}</style>
            <canvas
                ref={canvasRef}
                aria-hidden="true"
                className="pointer-events-none fixed inset-0 z-[9999] h-full w-full"
            />
            <div
                ref={cursorRef}
                aria-hidden="true"
                className="pointer-events-none fixed left-0 top-0 z-[10000] will-change-transform"
                style={{
                    opacity: 0,
                    transform: "translate3d(-100px, -100px, 0)",
                    filter: "drop-shadow(0 1px 1px rgba(0, 0, 0, 0.25))",
                }}
            >
                <svg width="30" height="30" viewBox="-1 -1 26 26" fill="none">
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
