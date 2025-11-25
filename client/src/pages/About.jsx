// src/pages/About.jsx
import React, { useState } from "react";
import {
  Users,
  Target,
  Sparkles,
  Heart,
  Globe2,
  TicketCheck,
  ShieldCheck,
  MapPin,
  Zap,
} from "lucide-react";
import { Link } from "react-router-dom";

/* =========================================================
   PASSIIFY BLUE/ORANGE THEME (LIGHT + DARK)
   ========================================================= */
const THEME = {
  accentBlue: "#2563EB", // blue-600
  accentSky: "#0EA5E9", // sky-500
  accentOrange: "#F97316", // orange-500
};

/* reusable pill */
const Pill = ({ label }) => (
  <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-slate-900/80 border border-slate-200/70 dark:border-slate-700/80 shadow-sm">
    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
    <span className="text-[11px] uppercase tracking-[0.22em] text-slate-700 dark:text-slate-100">
      {label}
    </span>
  </div>
);

/* stat chip */
const Stat = ({ label, value, hint }) => (
  <div className="rounded-2xl p-4 flex flex-col gap-1 bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-700/80">
    <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
      {label}
    </div>
    <div className="text-xl font-semibold text-slate-900 dark:text-slate-50">
      {value}
    </div>
    {hint && (
      <div className="text-xs text-slate-500 dark:text-slate-400">{hint}</div>
    )}
  </div>
);

/* persona card */
const PersonaCard = ({ badge, title, body }) => (
  <div className="rounded-2xl p-5 flex flex-col gap-2 bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 shadow-[0_18px_60px_rgba(15,23,42,0.18)] hover:-translate-y-1 hover:shadow-[0_26px_80px_rgba(15,23,42,0.35)] transition-all duration-300">
    <div className="text-[11px] uppercase tracking-[0.22em] text-slate-500 dark:text-slate-400">
      {badge}
    </div>
    <div className="text-sm md:text-base font-semibold text-slate-900 dark:text-slate-50">
      {title}
    </div>
    <p className="text-xs text-slate-600 dark:text-slate-400">{body}</p>
  </div>
);

export default function About() {
  const [view, setView] = useState("movers"); // "movers" | "hosts"

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-950 dark:to-black text-slate-900 dark:text-slate-50">
      {/* ambient glows */}
      <div className="pointer-events-none fixed inset-0 -z-10">
        <div className="absolute -top-40 -left-40 w-80 h-80 rounded-full bg-blue-500/25 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 w-96 h-96 rounded-full bg-orange-500/25 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.5),_transparent_55%)] dark:bg-[radial-gradient(circle_at_top,_rgba(148,163,184,0.25),_transparent_55%)]" />
      </div>

      {/* =====================================================
         HERO SECTION
         ===================================================== */}
      <section className="relative max-w-6xl mx-auto px-5 sm:px-6 pt-24 pb-14 md:pt-28">
        <div className="flex flex-col lg:flex-row gap-10 lg:items-center">
          {/* LEFT */}
          <div className="relative z-10 flex-1">
            <Pill label="ABOUT PASSIIFY · GYMS × EVENTS × DAY PASSES" />

            <h1 className="mt-4 text-3xl md:text-4xl lg:text-[2.7rem] font-black tracking-tight leading-tight text-slate-900 dark:text-white">
              Redefining{" "}
              <span
                style={{
                  backgroundImage: `linear-gradient(90deg, ${THEME.accentBlue}, ${THEME.accentOrange})`,
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                fitness freedom
              </span>{" "}
              for a new generation.
            </h1>

            <p className="mt-3 text-sm md:text-base max-w-xl text-slate-600 dark:text-slate-300">
              Passiify exists for travellers, students, expats and wanderers who
              hate contracts but love moving their body. One-day passes,
              drop-in events, zero pressure, all vibes — in any city you land
              in.
            </p>

            {/* CTAs — themed */}
            <div className="mt-6 flex flex-wrap gap-3 items-center">
              <Link
                to="/register"
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-full text-xs md:text-sm font-semibold shadow-[0_18px_60px_rgba(37,99,235,0.7)] hover:shadow-[0_22px_70px_rgba(37,99,235,0.9)] hover:scale-[1.02] active:scale-[0.99] transition-transform text-white"
                style={{
                  backgroundImage: `linear-gradient(120deg, ${THEME.accentBlue}, ${THEME.accentOrange})`,
                }}
              >
                Get started with Passiify
                <span className="ml-2 inline-flex items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] bg-black/10">
                  0% contracts
                </span>
              </Link>

              <Link
                to="/partner"
                className="inline-flex items-center justify-center px-5 py-2.5 rounded-full text-xs md:text-sm font-medium border border-slate-200 dark:border-slate-700 bg-white/80 dark:bg-slate-900/80 hover:bg-white dark:hover:bg-slate-800 transition-colors text-slate-900 dark:text-slate-100"
              >
                List your gym / event
              </Link>
            </div>

            {/* hero meta */}
            <div className="mt-4 flex flex-wrap gap-4 text-[11px]">
              <div className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <ShieldCheck className="w-4 h-4 text-emerald-500" />
                <span>No long-term lock-ins</span>
              </div>
              <div className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <TicketCheck className="w-4 h-4 text-orange-500" />
                <span>One-day gym passes & event tickets</span>
              </div>
              <div className="inline-flex items-center gap-2 text-slate-600 dark:text-slate-400">
                <Globe2 className="w-4 h-4 text-sky-500" />
                <span>Built for travellers & Gen-Z movers</span>
              </div>
            </div>
          </div>

          {/* RIGHT — stats card */}
          <div className="relative z-10 flex-1 flex justify-center lg:justify-end">
            <div className="relative w-full max-w-xs sm:max-w-sm">
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-sky-200 via-transparent to-orange-200 dark:from-sky-500/40 dark:via-transparent dark:to-orange-400/40 blur-xl opacity-80" />

              <div className="relative rounded-3xl px-5 py-5 bg-white/95 dark:bg-slate-950/95 border border-slate-200/80 dark:border-slate-800 shadow-[0_30px_90px_rgba(15,23,42,0.65)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold shadow-sm"
                      style={{
                        backgroundImage: `linear-gradient(135deg, ${THEME.accentBlue}, ${THEME.accentOrange})`,
                        color: "#F9FAFB",
                      }}
                    >
                      P
                    </div>
                    <div>
                      <div className="text-[11px] uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
                        Passiify mode
                      </div>
                      <div className="text-sm font-semibold text-slate-900 dark:text-slate-50">
                        Gyms & Events
                      </div>
                    </div>
                  </div>
                  <Zap className="w-5 h-5 text-orange-400" />
                </div>

                <div className="grid grid-cols-3 gap-3 text-[11px] mt-4">
                  <Stat label="Commitment" value="0%" hint="No yearly lock-ins" />
                  <Stat label="Access type" value="Day" hint="Passes & tickets" />
                  <Stat label="Vibe" value="High" hint="Community-first sessions" />
                </div>

                <div className="mt-3 rounded-2xl p-3 bg-slate-50/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800">
                  <div className="text-[11px] uppercase tracking-[0.18em] mb-1 text-slate-500 dark:text-slate-400">
                    A typical Passiify day
                  </div>
                  <ul className="space-y-1.5 text-[11px] text-slate-600 dark:text-slate-400">
                    <li className="flex gap-2">
                      <span className="mt-[3px] w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      <span>Land in city · open Passiify · find a gym/event</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-[3px] w-1.5 h-1.5 rounded-full bg-orange-400" />
                      <span>Buy a one-day pass or ticket in seconds</span>
                    </li>
                    <li className="flex gap-2">
                      <span className="mt-[3px] w-1.5 h-1.5 rounded-full bg-sky-400" />
                      <span>Train hard · meet people · no future lock-in</span>
                    </li>
                  </ul>
                </div>
              </div>

              <div className="hidden sm:block absolute -bottom-6 -left-4 rounded-2xl px-3 py-1.5 text-[10px] bg-white/95 dark:bg-slate-950/95 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-400 shadow-[0_18px_60px_rgba(15,23,42,0.45)]">
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-orange-500" />
                  <span>Built for people who travel, move & explore.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
         STORY — GYMS + EVENTS
         ===================================================== */}
      <section className="relative max-w-6xl mx-auto py-10 px-5 sm:px-6">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold mb-4 text-slate-900 dark:text-slate-50">
              The story behind{" "}
              <span
                style={{
                  backgroundImage: `linear-gradient(90deg, ${THEME.accentOrange}, ${THEME.accentBlue})`,
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                Passiify
              </span>
              .
            </h2>
            <p className="text-sm md:text-[15px] leading-relaxed mb-3 text-slate-600 dark:text-slate-300">
              Passiify started with a simple frustration: traditional gym
              memberships and “annual packages” don&apos;t work for people who
              travel, move cities or just like to experiment. Why should you
              sign a 6–12 month contract just to drop into a few sessions?
            </p>
            <p className="text-sm md:text-[15px] leading-relaxed mb-3 text-slate-600 dark:text-slate-300">
              We imagined a world where you could land in a new city, open one
              app and instantly find a local gym,{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-50">
                a fight club, a yoga rooftop, or even a one-night fitness event
              </span>{" "}
              filled with people who think like you.
            </p>
            <p className="text-sm md:text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
              So we built Passiify: a platform where you can buy{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-50">
                one-day fitness passes
              </span>{" "}
              to gyms and studios, and also discover{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-50">
                curated fitness events
              </span>{" "}
              — runs, bootcamps, workshops, retreats, marathons and more. No
              paperwork. No sales desk drama. Just pure freedom to move and
              meet people through fitness.
            </p>
          </div>

          <div className="flex justify-center md:justify-end">
            <div className="relative w-full md:w-4/5">
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-tr from-sky-200 via-transparent to-orange-200 dark:from-sky-500/40 dark:via-transparent dark:to-orange-400/40 blur-lg opacity-80" />
              <img
                src="https://images.unsplash.com/photo-1558611848-73f7eb4001a1?auto=format&fit=crop&w=900&q=80"
                alt="People training together at a gym"
                className="relative rounded-3xl object-cover shadow-[0_30px_90px_rgba(15,23,42,0.7)] border border-slate-200/80 dark:border-slate-800"
              />
              <div className="absolute bottom-3 right-3 rounded-full px-3 py-1.5 text-[10px] flex items-center gap-2 bg-white/95 dark:bg-slate-950/95 border border-slate-200/80 dark:border-slate-800 text-slate-600 dark:text-slate-300 shadow-md">
                <Users className="w-3.5 h-3.5 text-orange-500" />
                <span>Real people. Real sessions. Real stories.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
         EVENTS SECTION
         ===================================================== */}
      <section className="max-w-6xl mx-auto py-10 px-5 sm:px-6">
        <div className="rounded-3xl px-5 py-7 md:px-8 md:py-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-7 bg-white/95 dark:bg-slate-950/95 border border-slate-200/80 dark:border-slate-800 shadow-[0_18px_70px_rgba(15,23,42,0.22)]">
          <div className="max-w-xl">
            <h2 className="text-2xl md:text-3xl font-semibold mb-2 text-slate-900 dark:text-slate-50">
              Passiify events: more than just a workout.
            </h2>
            <p className="text-sm md:text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
              Events on Passiify are built around moments — not memberships.
              Think sunrise yoga meetups, city runs, strength meetups,
              fight-night camps, dance jams and pop-up bootcamps where
              travellers and locals train together and actually talk after.
            </p>
            <p className="mt-3 text-sm md:text-[15px] leading-relaxed text-slate-600 dark:text-slate-300">
              You can book{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-50">
                one-off tickets
              </span>{" "}
              to these sessions the same way you book a café table or a movie,
              and still keep your next day completely open. No recurring
              charges. No lock-in. Just one event, one story, one memory.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[11px] md:text-xs w-full lg:w-[46%]">
            {[
              {
                title: "For travellers",
                desc: "Anchor your trip around one powerful session – a run, a camp, a flow – and meet people you'd never find on Instagram.",
              },
              {
                title: "For local hosts",
                desc: "Turn your studio, gym floor or beach into a magnet for like-minded movers — without building your own booking system.",
              },
              {
                title: "For experimenters",
                desc: "Test new disciplines, coaches and communities in a single evening or weekend, then decide what sticks.",
              },
              {
                title: "For shy starters",
                desc: "Events are low-commitment entry points — easier than walking into a gym alone and asking for a long-term plan.",
              },
            ].map((card, idx) => (
              <div
                key={idx}
                className="rounded-2xl px-4 py-3 bg-slate-50/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800"
              >
                <div className="font-semibold mb-1 text-slate-900 dark:text-slate-50">
                  {card.title}
                </div>
                <p className="text-slate-600 dark:text-slate-400">{card.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* =====================================================
         MOVERS vs HOSTS TOGGLE
         ===================================================== */}
      <section className="max-w-6xl mx-auto py-10 px-5 sm:px-6">
        <div className="rounded-3xl px-5 py-7 md:px-8 md:py-8 bg-white/95 dark:bg-slate-950/95 border border-slate-200/80 dark:border-slate-800 shadow-[0_18px_70px_rgba(15,23,42,0.22)]">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-5">
            <div>
              <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 dark:text-slate-50">
                One platform. Two heroes.
              </h2>
              <p className="mt-2 text-sm max-w-xl text-slate-600 dark:text-slate-300">
                Passiify is built both for people who want to move and gyms &
                hosts who want to fill their space. Switch views to see how it
                works for you.
              </p>
            </div>

            <div className="inline-flex p-1 rounded-full text-[11px] bg-slate-100/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-700">
              <button
                onClick={() => setView("movers")}
                className="px-4 py-1.5 rounded-full flex items-center gap-1 transition-colors"
                style={{
                  backgroundImage:
                    view === "movers"
                      ? `linear-gradient(120deg, ${THEME.accentBlue}, ${THEME.accentOrange})`
                      : "none",
                  color: view === "movers" ? "#F9FAFB" : undefined,
                }}
              >
                <Users className="w-3.5 h-3.5" />
                Movers
              </button>
              <button
                onClick={() => setView("hosts")}
                className="px-4 py-1.5 rounded-full flex items-center gap-1 transition-colors text-slate-600 dark:text-slate-300"
                style={{
                  backgroundImage:
                    view === "hosts"
                      ? `linear-gradient(120deg, ${THEME.accentBlue}, ${THEME.accentOrange})`
                      : "none",
                  color: view === "hosts" ? "#F9FAFB" : undefined,
                }}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Gyms & hosts
              </button>
            </div>
          </div>

          {view === "movers" ? (
            <div className="grid md:grid-cols-3 gap-5 text-sm">
              {[
                {
                  step: "Step 1",
                  title: "Discover gyms & events",
                  body: "Browse gyms and fitness events in your city or the next one you’re visiting – filtered by vibe, discipline and time.",
                },
                {
                  step: "Step 2",
                  title: "Buy a one-day pass or ticket",
                  body: "Pay once, access for that day/session. No surprise renewals, no sales calls, no contracts hiding in the fine print.",
                },
                {
                  step: "Step 3",
                  title: "Show up. Move. Repeat.",
                  body: "Scan in, train hard, talk to people, then decide tomorrow’s plan with a clear head and a free calendar.",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl p-5 bg-slate-50/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800"
                >
                  <div className="text-[11px] uppercase tracking-[0.18em] mb-1 text-slate-500 dark:text-slate-400">
                    {item.step}
                  </div>
                  <h3 className="text-sm font-semibold mb-1 text-slate-900 dark:text-slate-50">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid md:grid-cols-3 gap-5 text-sm">
              {[
                {
                  label: "For gyms & studios",
                  title: "Fill empty hours without discounts",
                  body: "List your gym with day passes and special event slots. Reach travellers, students and locals who hate long forms but love good equipment.",
                },
                {
                  label: "For event hosts",
                  title: "Focus on programming, not logistics",
                  body: "Use Passiify as your booking layer. We handle discovery & ticketing, you design the run, camp, workshop or retreat.",
                },
                {
                  label: "Trust & safety",
                  title: "Clear expectations for both sides",
                  body: "Transparent pricing, clear time windows, and clear rules so you host confidently and guests know exactly what to expect.",
                },
              ].map((item, idx) => (
                <div
                  key={idx}
                  className="rounded-2xl p-5 bg-slate-50/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800"
                >
                  <div className="text-[11px] uppercase tracking-[0.18em] mb-1 text-slate-500 dark:text-slate-400">
                    {item.label}
                  </div>
                  <h3 className="text-sm font-semibold mb-1 text-slate-900 dark:text-slate-50">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400">
                    {item.body}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* =====================================================
         MISSION
         ===================================================== */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-5 sm:px-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full mb-5 bg-white/90 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-700 shadow-sm">
            <Target size={30} className="text-orange-500" />
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold mb-3 text-slate-900 dark:text-slate-50">
            Our mission
          </h2>
          <p className="text-sm md:text-base leading-relaxed max-w-2xl mx-auto text-slate-600 dark:text-slate-300">
            To make fitness{" "}
            <span className="font-semibold text-slate-900 dark:text-slate-50">
              simple, flexible and local
            </span>{" "}
            for people who don&apos;t want to be tied down. Whether you&apos;re a
            traveller hopping between countries, a student between semesters, or
            just someone who gets bored easily — Passiify lets you move without
            limits, through gyms <em>and</em> events.
          </p>
        </div>
      </section>

      {/* =====================================================
         WHO WE'RE BUILT FOR
         ===================================================== */}
      <section className="max-w-6xl mx-auto py-14 px-5 sm:px-6">
        <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center text-slate-900 dark:text-slate-50">
          Who we&apos;re built for
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          <PersonaCard
            badge="Travellers"
            title="People who treat cities like playgrounds."
            body="Land in a new city, find a local gym, a running crew or a fight camp, and drop in for a day. No fake 'tourist' pricing, no gym-hunting stress."
          />
          <PersonaCard
            badge="Movers & Gen-Z"
            title="People who hate long-term anything."
            body="Switch from MMA to dance to lifting to weekend events — without losing money to unused memberships and long-term contracts."
          />
          <PersonaCard
            badge="Locals & hosts"
            title="Gyms and studios that love new faces."
            body="Fill empty slots, run special events, and reach people who would never walk in off the street — but will show up for an experience."
          />
        </div>
      </section>

      {/* =====================================================
         VALUES
         ===================================================== */}
      <section className="max-w-6xl mx-auto py-14 px-5 sm:px-6">
        <h2 className="text-2xl md:text-3xl font-semibold mb-8 text-center text-slate-900 dark:text-slate-50">
          Our core values
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: (
                <Users className="w-8 h-8 mx-auto mb-3 text-orange-500" />
              ),
              title: "Community first",
              desc: "We believe the best workouts come with stories, not just stats. We exist to connect travellers, locals and coaches.",
            },
            {
              icon: (
                <Sparkles className="w-8 h-8 mx-auto mb-3 text-orange-500" />
              ),
              title: "Play & experimentation",
              desc: "Fitness shouldn’t feel like punishment. We encourage trying, exploring and switching things up without guilt.",
            },
            {
              icon: (
                <Heart className="w-8 h-8 mx-auto mb-3 text-orange-500" />
              ),
              title: "Respect for your time",
              desc: "No hidden fees, no long-term lock-ins. Your time, energy and money are treated like they matter.",
            },
          ].map((value, i) => (
            <div
              key={i}
              className="rounded-2xl p-6 bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800 shadow-[0_18px_60px_rgba(15,23,42,0.18)]"
            >
              {value.icon}
              <h3 className="text-sm md:text-base font-semibold mb-2 text-center text-slate-900 dark:text-slate-50">
                {value.title}
              </h3>
              <p className="text-xs text-center text-slate-600 dark:text-slate-400">
                {value.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================
         FOUNDER NOTE
         ===================================================== */}
      <section className="max-w-5xl mx-auto py-10 px-5 sm:px-6">
        <div className="rounded-3xl px-6 py-7 md:px-8 md:py-8 flex flex-col md:flex-row gap-6 items-start bg-white/95 dark:bg-slate-950/95 border border-slate-200/80 dark:border-slate-800 shadow-[0_20px_70px_rgba(15,23,42,0.4)]">
          <div className="flex-shrink-0">
            <div
              className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold shadow-[0_12px_40px_rgba(15,23,42,0.6)]"
              style={{
                backgroundImage: `linear-gradient(135deg, ${THEME.accentBlue}, ${THEME.accentOrange})`,
                color: "#F9FAFB",
              }}
            >
              RS
            </div>
          </div>

          <div>
            <div className="text-[11px] uppercase tracking-[0.26em] mb-1 text-slate-500 dark:text-slate-400">
              Founder&apos;s note
            </div>
            <h3 className="text-sm md:text-base font-semibold mb-2 text-slate-900 dark:text-slate-50">
              From Rubal Saini · Founder of Passiify
            </h3>
            <p className="text-xs md:text-[13px] leading-relaxed mb-2 text-slate-600 dark:text-slate-300">
              I&apos;m a student, but more than that, I&apos;m someone who can&apos;t
              function without training. The gym is non-negotiable for me. I
              love trying new things — different styles, different disciplines,
              different ways to push my body.
            </p>
            <p className="text-xs md:text-[13px] leading-relaxed mb-2 text-slate-600 dark:text-slate-300">
              Every time I thought about going to a new city, I didn&apos;t just
              want to see tourist spots — I wanted to{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-50">
                meet people through fitness
              </span>
              . Join a local bootcamp, hit a gritty gym, drop into a fight
              camp, try a yoga session with strangers who become friends. But
              there was no single platform that let me book those experiences
              easily.
            </p>
            <p className="text-xs md:text-[13px] leading-relaxed mb-2 text-slate-600 dark:text-slate-300">
              Everything was either long-term memberships, sketchy DMs, or
              random Google searches. No clean way to grab a{" "}
              <span className="font-semibold text-slate-900 dark:text-slate-50">
                one-day pass or a ticket to a fitness event
              </span>{" "}
              and just show up.
            </p>
            <p className="text-xs md:text-[13px] leading-relaxed text-slate-600 dark:text-slate-300">
              Passiify is my attempt to fix that — to build something
              revolutionary for people like us. A place where you can treat
              fitness like adventure: book a gym session today, a run or event
              tomorrow, in any city, without ever being trapped by a contract.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
         CTA — BLUE/ORANGE GRADIENT
         ===================================================== */}
      <section className="relative overflow-hidden mt-4">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(120deg, ${THEME.accentBlue}, ${THEME.accentOrange})`,
            opacity: 0.97,
          }}
        />
        <div className="relative max-w-4xl mx-auto px-5 sm:px-6 py-14 text-center">
          <h2 className="text-2xl md:text-3xl font-black mb-3 text-slate-900">
            Join the Passiify movement.
          </h2>
          <p className="text-xs md:text-sm mb-6 max-w-2xl mx-auto text-slate-800/80">
            Be part of a fitness culture where commitment means showing up for
            yourself — not signing a contract. Your next gym session or fitness
            event in any city is literally one tap away.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/register"
              className="inline-flex items-center justify-center px-7 py-3 rounded-full text-xs md:text-sm font-semibold shadow-[0_16px_50px_rgba(15,23,42,0.45)] hover:scale-[1.02] active:scale-[0.99] transition-transform bg-slate-900 text-slate-50"
            >
              Get started with Passiify
            </Link>
            <Link
              to="/partner"
              className="inline-flex items-center justify-center px-6 py-3 rounded-full text-xs md:text-sm font-medium border border-slate-900/15 bg-slate-50/95 text-slate-900"
            >
              List your gym or event
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
