// src/pages/About.jsx
import React from "react";
import { Users, Target, Sparkles, Heart } from "lucide-react";

/* =========================================================
   THEME TOKENS — match "Sunset Nomad" brand
   ========================================================= */
const THEME = {
  bg: "#050308", // deep plum-black
  bgSoft: "#0A0812",
  accent1: "#FF4B5C", // coral red
  accent2: "#FF9F68", // warm peach
  textMain: "#FDFCFB",
  textMuted: "#A3A3B5",
  borderSoft: "rgba(245, 213, 189, 0.22)",
};

export default function About() {
  return (
    <div
      className="min-h-screen text-gray-100"
      style={{
        backgroundColor: THEME.bg,
        backgroundImage:
          "radial-gradient(circle at top, rgba(248, 216, 181, 0.16), transparent 55%)",
      }}
    >
      {/* =====================================================
         HERO SECTION
         ===================================================== */}
      <section className="relative overflow-hidden">
        {/* subtle texture / glow */}
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute -top-40 -left-36 w-[420px] h-[420px] rounded-full blur-3xl opacity-40"
            style={{ background: THEME.accent1 }}
          />
          <div
            className="absolute -bottom-40 -right-36 w-[420px] h-[420px] rounded-full blur-3xl opacity-35"
            style={{ background: THEME.accent2 }}
          />
        </div>

        <div className="relative max-w-5xl mx-auto px-6 pt-28 pb-20 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-black/30 border border-white/15 mb-4">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[11px] uppercase tracking-[0.2em] text-gray-100">
              about passiify · built for movers
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-[2.7rem] font-black tracking-tight text-white">
            Redefining{" "}
            <span
              style={{
                backgroundImage: `linear-gradient(90deg, ${THEME.accent1}, ${THEME.accent2})`,
                WebkitBackgroundClip: "text",
                color: "transparent",
              }}
            >
              fitness freedom
            </span>{" "}
            for a new generation.
          </h1>

          <p className="mt-3 text-sm md:text-base text-gray-200 max-w-2xl mx-auto">
            Passiify exists for travellers, students, expats and wanderers who
            hate contracts but love moving their body. One-day passes, drop-in
            events, zero pressure, all vibes.
          </p>
        </div>
      </section>

      {/* =====================================================
         OUR STORY (GYMS + EVENTS)
         ===================================================== */}
      <section className="max-w-6xl mx-auto py-14 px-6">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-50 mb-4">
              The story behind{" "}
              <span
                style={{
                  backgroundImage: `linear-gradient(90deg, ${THEME.accent2}, ${THEME.accent1})`,
                  WebkitBackgroundClip: "text",
                  color: "transparent",
                }}
              >
                Passiify
              </span>
              .
            </h2>
            <p className="text-sm md:text-[15px] text-gray-300 leading-relaxed mb-3">
              Passiify started with a simple frustration: traditional gym
              memberships and “annual packages” don&apos;t work for people who
              travel, move cities or just like to experiment. Why should you
              sign a 6-month contract just to drop into a few sessions?
            </p>
            <p className="text-sm md:text-[15px] text-gray-300 leading-relaxed mb-3">
              We imagined a world where you could land in a new city, open an
              app and instantly find a local gym,{" "}
              <span className="font-semibold text-gray-50">
                a fight club, a yoga rooftop, or even a one-night fitness event
              </span>{" "}
              filled with people who think like you.
            </p>
            <p className="text-sm md:text-[15px] text-gray-300 leading-relaxed">
              So we built Passiify: a platform where you can buy{" "}
              <span className="font-semibold text-gray-50">
                one-day fitness passes
              </span>{" "}
              to gyms and studios, and also discover{" "}
              <span className="font-semibold text-gray-50">
                curated fitness events
              </span>{" "}
              — runs, bootcamps, workshops, retreats, marathons and more. No
              paperwork. No sales desk drama. Just pure freedom to move and
              meet people through fitness.
            </p>
          </div>

          <div className="flex justify-center md:justify-end">
            <div className="relative w-full md:w-4/5">
              <div className="absolute -inset-2 rounded-3xl bg-gradient-to-br from-white/10 via-white/0 to-white/10 blur-lg opacity-60" />
              <img
                src="https://images.unsplash.com/photo-1558611848-73f7eb4001a1?auto=format&fit=crop&w=900&q=80"
                alt="Passiify Story"
                className="relative rounded-3xl border border-white/15 shadow-[0_30px_90px_rgba(0,0,0,1)] object-cover"
              />
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
         PASSIIFY EVENTS SECTION
         ===================================================== */}
      <section className="max-w-6xl mx-auto py-10 px-6">
        <div className="rounded-3xl border border-white/12 bg-black/50 px-5 py-6 md:px-8 md:py-7 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="max-w-xl">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-50 mb-2">
              Passiify events: more than just a workout.
            </h2>
            <p className="text-sm md:text-[15px] text-gray-300 leading-relaxed">
              Events on Passiify are built around moments — not memberships.
              Think sunrise yoga meetups, city runs, strength meetups,
              fight-night camps, dance jams and pop-up bootcamps where
              travellers and locals train together and actually talk after.
            </p>
            <p className="mt-3 text-sm md:text-[15px] text-gray-300 leading-relaxed">
              You can book{" "}
              <span className="font-semibold text-gray-50">
                one-off tickets
              </span>{" "}
              to these sessions the same way you book a café table or a movie,
              and still keep your next day completely open. No recurring
              charges. No lock-in. Just one event, one story, one memory.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-[11px] md:text-xs text-gray-200">
            <div className="rounded-2xl border border-white/15 bg-black/60 px-4 py-3">
              <div className="font-semibold mb-1">For travellers</div>
              <p className="text-gray-400">
                Anchor your trip around one powerful session – a run, a camp, a
                flow – and meet people you&apos;d never find on Instagram.
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-black/60 px-4 py-3">
              <div className="font-semibold mb-1">For local hosts</div>
              <p className="text-gray-400">
                Turn your studio, gym floor or beach into a magnet for
                like-minded movers — without building your own booking system.
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-black/60 px-4 py-3">
              <div className="font-semibold mb-1">For experimenters</div>
              <p className="text-gray-400">
                Test out new disciplines, coaches and communities in a single
                evening or weekend, then decide what sticks.
              </p>
            </div>
            <div className="rounded-2xl border border-white/15 bg-black/60 px-4 py-3">
              <div className="font-semibold mb-1">For shy starters</div>
              <p className="text-gray-400">
                Events are low-commitment entry points — easier than walking
                into a gym alone and asking for a long-term plan.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
         MISSION SECTION
         ===================================================== */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-black/60 border border-white/15 mb-5">
            <Target size={30} className="text-orange-200" />
          </div>
          <h2 className="text-2xl md:text-3xl font-semibold text-gray-50 mb-3">
            Our mission
          </h2>
          <p className="text-sm md:text-base text-gray-200 leading-relaxed max-w-2xl mx-auto">
            To make fitness{" "}
            <span className="font-semibold">simple, flexible and local</span>{" "}
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
      <section className="max-w-6xl mx-auto py-14 px-6">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-50 mb-8 text-center">
          Who we&apos;re built for
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {/* Travellers */}
          <div className="rounded-2xl border border-white/15 bg-black/50 p-5 flex flex-col gap-2">
            <div className="text-[11px] uppercase tracking-[0.22em] text-gray-500">
              Travellers
            </div>
            <div className="text-sm md:text-base font-semibold text-gray-50">
              People who treat cities like playgrounds.
            </div>
            <p className="text-xs text-gray-300 mt-1">
              Land in a new city, find a local gym, a running crew or a fight
              camp, and drop in for a day. No fake &quot;tourist&quot; pricing.
            </p>
          </div>

          {/* Movers */}
          <div className="rounded-2xl border border-white/15 bg-black/50 p-5 flex flex-col gap-2">
            <div className="text-[11px] uppercase tracking-[0.22em] text-gray-500">
              Movers & Gen-Z
            </div>
            <div className="text-sm md:text-base font-semibold text-gray-50">
              People who hate long-term anything.
            </div>
            <p className="text-xs text-gray-300 mt-1">
              Switch from MMA to dance to lifting to weekend events — without
              losing money to unused memberships and long-term contracts.
            </p>
          </div>

          {/* Locals */}
          <div className="rounded-2xl border border-white/15 bg-black/50 p-5 flex flex-col gap-2">
            <div className="text-[11px] uppercase tracking-[0.22em] text-gray-500">
              Locals & hosts
            </div>
            <div className="text-sm md:text-base font-semibold text-gray-50">
              Gyms and studios that love new faces.
            </div>
            <p className="text-xs text-gray-300 mt-1">
              Fill empty slots, run special events, and reach people who would
              never walk in off the street — but will show up for an
              experience.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
         VALUES SECTION
         ===================================================== */}
      <section className="max-w-6xl mx-auto py-14 px-6">
        <h2 className="text-2xl md:text-3xl font-semibold text-gray-50 mb-8 text-center">
          Our core values
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {[
            {
              icon: (
                <Users className="w-8 h-8 text-orange-200 mx-auto mb-3" />
              ),
              title: "Community first",
              desc: "We believe the best workouts come with stories, not just stats. We exist to connect travellers, locals and coaches.",
            },
            {
              icon: (
                <Sparkles className="w-8 h-8 text-orange-200 mx-auto mb-3" />
              ),
              title: "Play & experimentation",
              desc: "Fitness shouldn’t feel like punishment. We encourage trying, exploring and switching things up without guilt.",
            },
            {
              icon: (
                <Heart className="w-8 h-8 text-orange-200 mx-auto mb-3" />
              ),
              title: "Respect for your time",
              desc: "No hidden fees, no long-term lock-ins. Your time, energy and money are treated like they matter.",
            },
          ].map((value, i) => (
            <div
              key={i}
              className="bg-black/50 rounded-2xl border border-white/15 p-6 shadow-[0_18px_60px_rgba(0,0,0,0.9)] hover:border-white/40 hover:shadow-[0_24px_80px_rgba(0,0,0,1)] transition-all duration-300 text-center"
            >
              {value.icon}
              <h3 className="text-sm md:text-base font-semibold text-gray-50 mb-2">
                {value.title}
              </h3>
              <p className="text-xs text-gray-300">{value.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* =====================================================
         FOUNDER NOTE — RUBAL SAINI
         ===================================================== */}
      <section className="max-w-5xl mx-auto py-10 px-6">
        <div className="rounded-3xl border border-white/15 bg-black/55 px-6 py-7 md:px-8 md:py-8 flex flex-col md:flex-row gap-6 items-start">
          {/* avatar */}
          <div className="flex-shrink-0">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-white/80 to-white/40 flex items-center justify-center text-gray-900 font-bold text-xl shadow-[0_12px_40px_rgba(0,0,0,0.8)]">
              RS
            </div>
          </div>

          {/* text */}
          <div>
            <div className="text-[11px] uppercase tracking-[0.26em] text-gray-500 mb-1">
              Founder&apos;s note
            </div>
            <h3 className="text-sm md:text-base font-semibold text-gray-50 mb-2">
              From Rubal Saini · Founder of Passiify
            </h3>
            <p className="text-xs md:text-[13px] text-gray-300 leading-relaxed mb-2">
              I&apos;m a student, but more than that, I&apos;m someone who can&apos;t
              function without training. The gym is non-negotiable for me. I
              love trying new things — different styles, different disciplines,
              different ways to push my body.
            </p>
            <p className="text-xs md:text-[13px] text-gray-300 leading-relaxed mb-2">
              Every time I thought about going to a new city, I didn&apos;t just
              want to see tourist spots — I wanted to{" "}
              <span className="font-semibold text-gray-50">
                meet people through fitness
              </span>
              . Join a local bootcamp, hit a gritty gym, drop into a fight
              camp, try a yoga session with strangers who become friends. But
              there was no single platform that let me book those experiences
              easily.
            </p>
            <p className="text-xs md:text-[13px] text-gray-300 leading-relaxed mb-2">
              Everything was either long-term memberships, sketchy DMs, or
              random Google searches. No clean way to grab a{" "}
              <span className="font-semibold text-gray-50">
                one-day pass or a ticket to a fitness event
              </span>{" "}
              and just show up.
            </p>
            <p className="text-xs md:text-[13px] text-gray-300 leading-relaxed">
              Passiify is my attempt to fix that — to build something
              revolutionary for people like us. A place where you can treat
              fitness like adventure: book a gym session today, a run or event
              tomorrow, in any city, without ever being trapped by a contract.
            </p>
          </div>
        </div>
      </section>

      {/* =====================================================
         CTA SECTION
         ===================================================== */}
      <section className="relative overflow-hidden mt-4">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `linear-gradient(120deg, ${THEME.accent1}, ${THEME.accent2})`,
            opacity: 0.97,
          }}
        />
        <div className="relative max-w-4xl mx-auto px-6 py-14 text-center text-gray-900">
          <h2 className="text-2xl md:text-3xl font-black mb-3">
            Join the Passiify movement.
          </h2>
          <p className="text-xs md:text-sm text-black/75 mb-6 max-w-2xl mx-auto">
            Be part of a fitness culture where commitment means showing up for
            yourself — not signing a contract. Your next gym session or fitness
            event in any city is literally one tap away.
          </p>
          <a
            href="/register"
            className="inline-flex items-center justify-center px-7 py-3 rounded-full text-xs md:text-sm font-semibold bg-black text-white shadow-[0_16px_50px_rgba(0,0,0,0.8)] hover:scale-[1.02] transition-transform"
          >
            Get started with Passiify
          </a>
        </div>
      </section>
    </div>
  );
}
