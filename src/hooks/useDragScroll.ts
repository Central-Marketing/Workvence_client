import { useRef, useState, useCallback, useEffect } from "react";

interface UseDragScrollOptions {
  /** Speed multiplier for the drag scroll (default: 1) */
  multiplier?: number;
  /** Minimum pixel movement required to count as a drag rather than a click (default: 5) */
  dragThreshold?: number;
}

/**
 * Custom hook to enable horizontal click-and-drag scrolling on any container.
 * Seamlessly handles:
 * - Smooth drag-to-scroll left and right
 * - Distinguishing clicks from drags so child button clicks aren't triggered accidentally
 * - Cursor grab / grabbing states
 * - Global window tracking during drag to prevent abrupt release when cursor moves outside container
 */
export function useDragScroll<T extends HTMLElement = HTMLDivElement>(
  options: UseDragScrollOptions = {}
) {
  const { multiplier = 1, dragThreshold = 5 } = options;

  const containerRef = useRef<T | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Mutable refs to track active drag state without unnecessary re-renders
  const isDownRef = useRef(false);
  const startXRef = useRef(0);
  const scrollLeftRef = useRef(0);
  const hasDraggedRef = useRef(false);

  const onMouseDown = useCallback(
    (e: React.MouseEvent<T>) => {
      // Only respond to primary (left) mouse clicks
      if (e.button !== 0 || !containerRef.current) return;

      isDownRef.current = true;
      hasDraggedRef.current = false;
      startXRef.current = e.pageX - containerRef.current.offsetLeft;
      scrollLeftRef.current = containerRef.current.scrollLeft;
    },
    []
  );

  const onClickCapture = useCallback((e: React.MouseEvent<T>) => {
    // If user dragged past the threshold, suppress click on child buttons
    if (hasDraggedRef.current) {
      e.stopPropagation();
      e.preventDefault();
      hasDraggedRef.current = false;
    }
  }, []);

  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!isDownRef.current || !containerRef.current) return;

      const currentX = e.pageX - containerRef.current.offsetLeft;
      const walk = (currentX - startXRef.current) * multiplier;

      if (Math.abs(walk) > dragThreshold) {
        if (!hasDraggedRef.current) {
          hasDraggedRef.current = true;
          setIsDragging(true);
        }
      }

      if (hasDraggedRef.current) {
        // Prevent accidental text selection while dragging
        e.preventDefault();
        containerRef.current.scrollLeft = scrollLeftRef.current - walk;
      }
    };

    const handleGlobalMouseUp = () => {
      if (isDownRef.current) {
        isDownRef.current = false;
        setIsDragging(false);

        // Reset hasDragged after a tick if no click event caught it
        setTimeout(() => {
          hasDraggedRef.current = false;
        }, 100);
      }
    };

    window.addEventListener("mousemove", handleGlobalMouseMove);
    window.addEventListener("mouseup", handleGlobalMouseUp);

    return () => {
      window.removeEventListener("mousemove", handleGlobalMouseMove);
      window.removeEventListener("mouseup", handleGlobalMouseUp);
    };
  }, [multiplier, dragThreshold]);

  return {
    ref: containerRef,
    isDragging,
    events: {
      onMouseDown,
      onClickCapture,
    },
  };
}

export default useDragScroll;
