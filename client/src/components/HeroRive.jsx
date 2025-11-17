// src/components/HeroRive.jsx
import React, { useEffect, useState } from "react";
import Rive from "@rive-app/react-canvas";

/**
 * HeroRive
 * - Tries to use Rive at `rivePath` (default: /riv/hero.riv)
 * - If Rive is not available / fails, falls back to an animated SVG wave (Energy Wave)
 *
 * Props:
 * - rivePath (string) optional
 * - className (string) optional
 */
export default function HeroRive({ rivePath = "/riv/hero.riv", className = "w-full h-full" }) {
  const [riveOk, setRiveOk] = useState(null); // null = checking, true/false = result

  useEffect(() => {
    let mounted = true;
    // quick HEAD check to avoid trying to load wrong/corrupt file
    fetch(rivePath, { method: "HEAD" })
      .then((res) => {
        if (!mounted) return;
        setRiveOk(res.ok);
      })
      .catch(() => {
        if (!mounted) return;
        setRiveOk(false);
      });
    return () => {
      mounted = false;
    };
  }, [rivePath]);

  // ENERGY WAVE SVG fallback (teal -> sunset palette)
  const SVGWave = () => (
    <div className={`w-full h-full ${className} relative overflow-hidden bg-gradient-to-br from-[#0E7490] to-[#FB923C]`}>
      <svg
        viewBox="0 0 1200 520"
        preserveAspectRatio="xMidYMid slice"
        className="w-full h-full animate-wave-float"
        style={{ display: "block" }}
      >
        <defs>
          <linearGradient id="g1" x1="0" x2="1">
            <stop offset="0%" stopColor="#0E7490" stopOpacity="0.95" />
            <stop offset="60%" stopColor="#06B6D4" stopOpacity="0.8" />
            <stop offset="100%" stopColor="#FB923C" stopOpacity="0.7" />
          </linearGradient>
          <filter id="blurMe">
            <feGaussianBlur stdDeviation="22" />
          </filter>
        </defs>

        {/* big blurred background shape */}
        <path
          d="M0 300 C200 200 400 360 600 320 C800 280 1000 360 1200 300 L1200 520 L0 520 Z"
          fill="url(#g1)"
          opacity="0.7"
          filter="url(#blurMe)"
          className="wave-1"
        />

        {/* mid wave */}
        <path
          d="M0 320 C180 260 360 380 600 340 C840 300 960 360 1200 320 L1200 520 L0 520 Z"
          fill="rgba(255,255,255,0.06)"
          className="wave-2"
        />

        {/* foreground sharp wave */}
        <path
          d="M0 340 C160 300 320 420 600 360 C880 300 1040 360 1200 340 L1200 520 L0 520 Z"
          fill="rgba(255,255,255,0.12)"
          className="wave-3"
        />
      </svg>

      {/* subtle floating accents (circles) */}
      <div className="absolute -left-6 top-8 w-28 h-28 rounded-full bg-white/10 blur-sm animate-pulse-slow"></div>
      <div className="absolute right-6 bottom-12 w-20 h-20 rounded-full bg-white/8 blur-sm animate-pulse-slower"></div>
    </div>
  );

  // waiting indicator while checking
  if (riveOk === null) {
    return (
      <div className={`${className} flex items-center justify-center bg-gradient-to-br from-[#0E7490] to-[#FB923C]`}>
        <div className="text-white/90">Loading…</div>
      </div>
    );
  }

  return (
    <>
      {riveOk ? (
        // Rive exists — render it
        <div className={className}>
          <Rive src={rivePath} autoPlay style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      ) : (
        // fallback SVG Wave
        <SVGWave />
      )}
      <style>{`
        /* small animations for SVG fallback */
        @keyframes waveFloat {
          0% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-6px) scale(1.01); }
          100% { transform: translateY(0px) scale(1); }
        }
        .animate-wave-float { animation: waveFloat 6s ease-in-out infinite; }

        @keyframes pulseSlow {
          0% { transform: scale(1); opacity: 0.18; }
          50% { transform: scale(1.08); opacity: 0.28; }
          100% { transform: scale(1); opacity: 0.18; }
        }
        .animate-pulse-slow { animation: pulseSlow 5.5s ease-in-out infinite; }
        .animate-pulse-slower { animation: pulseSlow 8s ease-in-out infinite; }

        /* fine-grained parallax for wave layers (subtle horizontal motion) */
        .wave-1 { transform-origin: center; animation: waveMove1 18s linear infinite; }
        .wave-2 { transform-origin: center; animation: waveMove2 20s linear infinite; }
        .wave-3 { transform-origin: center; animation: waveMove3 14s linear infinite; }

        @keyframes waveMove1 { 0%{ transform: translateX(0);} 50%{ transform: translateX(-18px);} 100%{ transform: translateX(0);} }
        @keyframes waveMove2 { 0%{ transform: translateX(0);} 50%{ transform: translateX(10px);} 100%{ transform: translateX(0);} }
        @keyframes waveMove3 { 0%{ transform: translateX(0);} 50%{ transform: translateX(-8px);} 100%{ transform: translateX(0);} }
      `}</style>
    </>
  );
}
