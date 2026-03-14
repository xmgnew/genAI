"use client";

import { useEffect } from "react";

function updateSpotlight(target, event) {
  const rect = target.getBoundingClientRect();
  const x = ((event.clientX - rect.left) / rect.width) * 100;
  const y = ((event.clientY - rect.top) / rect.height) * 100;
  target.style.setProperty("--spot-x", `${x}%`);
  target.style.setProperty("--spot-y", `${y}%`);
}

export function InteractionEffects() {
  useEffect(() => {
    function handlePointerMove(event) {
      document.documentElement.style.setProperty("--pointer-x", `${event.clientX}px`);
      document.documentElement.style.setProperty("--pointer-y", `${event.clientY}px`);

      const spotlightTarget = event.target instanceof Element ? event.target.closest(".spotlight-card") : null;
      if (spotlightTarget instanceof HTMLElement) {
        updateSpotlight(spotlightTarget, event);
      }
    }

    function handleClick(event) {
      const target = event.target instanceof Element ? event.target.closest("[data-click-fx]") : null;
      if (!(target instanceof HTMLElement)) {
        return;
      }

      const rect = target.getBoundingClientRect();
      const ripple = document.createElement("span");
      ripple.className = "fx-ripple";
      ripple.style.left = `${event.clientX - rect.left}px`;
      ripple.style.top = `${event.clientY - rect.top}px`;
      target.appendChild(ripple);
      ripple.addEventListener("animationend", () => ripple.remove(), { once: true });
    }

    window.addEventListener("pointermove", handlePointerMove, { passive: true });
    document.addEventListener("click", handleClick);

    return () => {
      window.removeEventListener("pointermove", handlePointerMove);
      document.removeEventListener("click", handleClick);
    };
  }, []);

  return null;
}
