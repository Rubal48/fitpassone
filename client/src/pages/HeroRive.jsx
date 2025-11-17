// src/components/HeroRive.jsx
import React, { useEffect } from "react";
import { useRive, Layout, Fit, Alignment } from "@rive-app/react-canvas";

/**
 * HeroRive props:
 * - src: path to riv (default /riv/hero.riv)
 * - autoplay: boolean
 */
export default function HeroRive({ src = "/riv/hero.riv", autoplay = true }) {
  const { rive, RiveComponent } = useRive({
    src,
    autoplay,
    layout: new Layout({ fit: Fit.Cover, alignment: new Alignment(0, 0) }),
  });

  useEffect(() => {
    return () => {
      try {
        rive?.cleanup?.();
      } catch (e) {}
    };
  }, [rive]);

  return <div className="w-full h-full"><RiveComponent style={{ width: "100%", height: "100%" }} /></div>;
}
