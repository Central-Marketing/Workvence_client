/**
 * One-shot border reveal for gradient-border modals.
 *
 * Two ways to use it:
 *
 * 1. Gradient shell (`Modal`, `AuthModal`, ...): render as the LAST child of a `relative`
 *    element that has `p-[<thickness>px]`, a rounded radius and a CSS gradient background.
 *    Pass that element's radius and padding as `radius` / `thickness`.
 *
 * 2. Plain card: render inside any `relative` card with `withBase`. It draws the static gradient
 *    border itself (inside the card's own box), so the card needs no extra wrapper and must not
 *    have its own `border`. Pass the card's radius and the desired `thickness`.
 *
 * The border starts solid white, then the white is erased along the perimeter to reveal the
 * gradient. The animation lives in globals.css (`.border-beam`) and replays on every mount, so it
 * plays once each time a conditionally rendered modal opens.
 */
import { useId } from "react";
import type { CSSProperties } from "react";

interface BorderBeamProps {
  /** Outer border-radius of the shell/card, in px. */
  radius?: number;
  /** Border thickness, in px. */
  thickness?: number;
  /** Also draw the static gradient border (for cards without a gradient shell). */
  withBase?: boolean;
}

export const BorderBeam = ({ radius = 6, thickness = 3, withBase = false }: BorderBeamProps) => {
  const gradientId = useId();
  const rx = Math.max(radius - thickness / 2, 0);

  return (
    <svg
      aria-hidden="true"
      className="border-beam"
      style={{ "--beam-thickness": `${thickness}px` } as CSSProperties}
    >
      {withBase && (
        <>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#00A6FF" />
              <stop offset="50%" stopColor="#3ED419" />
              <stop offset="100%" stopColor="#F29EFF" />
            </linearGradient>
          </defs>
          <rect
            className="border-beam__base"
            x="0"
            y="0"
            width="100%"
            height="100%"
            rx={rx}
            style={{ stroke: `url(#${gradientId})`, strokeDasharray: "none", animation: "none" }}
          />
        </>
      )}
      <rect x="0" y="0" width="100%" height="100%" rx={rx} pathLength={1} />
    </svg>
  );
};

export default BorderBeam;
