// src/pages/TermsAndConditions.jsx
import React, { useEffect, useState } from "react";
import { ShieldCheck, BookOpen, Scale, ArrowLeft, Globe2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

/* =========================================================
   PASSIIFY THEME TOKENS — shared blue / sky / orange
   ========================================================= */
const THEME = {
  accentFrom: "#2563EB", // blue-600
  accentMid: "#0EA5E9", // sky-500
  accentTo: "#F97316", // orange-500
};

const primaryGradient = `linear-gradient(120deg, ${THEME.accentFrom}, ${THEME.accentMid}, ${THEME.accentTo})`;
const primaryGradient90 = `linear-gradient(90deg, ${THEME.accentFrom}, ${THEME.accentMid}, ${THEME.accentTo})`;

/* =========================================================
   DARK/LIGHT MODE — follow system preference automatically
   ========================================================= */
const getSystemMode = () => {
  if (typeof window === "undefined" || !window.matchMedia) return "dark";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
};

const TermsAndConditions = () => {
  const [mode, setMode] = useState(getSystemMode);
  const navigate = useNavigate();

  // Sync with system dark/light and react to changes
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const listener = (e) => setMode(e.matches ? "dark" : "light");
    mq.addEventListener("change", listener);
    return () => mq.removeEventListener("change", listener);
  }, []);

  const accentBorder =
    "border border-slate-200/80 dark:border-slate-800/80 rounded-3xl";

  return (
    <div className={mode === "dark" ? "dark" : ""}>
      {/* Background wrapper */}
      <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-slate-50 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 text-slate-900 dark:text-slate-50">
        {/* Ambient glows */}
        <div className="pointer-events-none fixed inset-0 -z-10">
          <div className="absolute -top-40 -left-20 w-80 h-80 rounded-full bg-blue-500/20 blur-3xl" />
          <div className="absolute -bottom-40 -right-24 w-96 h-96 rounded-full bg-orange-500/20 blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-72 h-72 rounded-full bg-sky-400/12 blur-3xl" />
        </div>

        <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-24 pb-16">
          {/* Back + page meta */}
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Back
            </button>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-900/90 dark:bg-slate-900/80 border border-slate-700 text-[10px] sm:text-[11px] text-slate-100 shadow-[0_18px_60px_rgba(15,23,42,0.7)]">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span className="uppercase tracking-[0.18em]">
                Terms & Policies
              </span>
            </div>
          </div>

          {/* Hero card */}
          <section
            className={`mb-8 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl shadow-[0_26px_90px_rgba(15,23,42,0.7)] ${accentBorder}`}
          >
            <div className="relative overflow-hidden rounded-3xl">
              {/* subtle grid */}
              <div
                className="pointer-events-none absolute inset-0 opacity-[0.14]"
                style={{
                  backgroundImage:
                    "linear-gradient(to right, rgba(148,163,184,0.17) 1px, transparent 1px), linear-gradient(to bottom, rgba(148,163,184,0.17) 1px, transparent 1px)",
                  backgroundSize: "36px 36px",
                }}
              />

              <div className="relative px-5 sm:px-7 py-6 sm:py-7 space-y-3 sm:space-y-4">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 text-[10px] sm:text-[11px]">
                  <BookOpen className="w-3.5 h-3.5 text-sky-500" />
                  <span className="uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    Please read carefully before using Passiify
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
                  Passiify Terms &amp; Conditions
                </h1>

                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
                  These Terms &amp; Conditions (&quot;Terms&quot;) govern your
                  access to and use of Passiify&apos;s website, mobile
                  experience and related services for booking gyms, studios and
                  events (collectively, the &quot;Platform&quot;). By using
                  Passiify, you agree to these Terms.
                </p>

                <div className="flex flex-wrap gap-2 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                    <Globe2 className="w-3.5 h-3.5 text-sky-500" />
                    Applicable where Passiify operates &amp; hosts are listed
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                    <Scale className="w-3.5 h-3.5 text-amber-500" />
                    Not legal advice — review with your own counsel
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Legal note */}
          <section
            className={`mb-8 bg-sky-50/80 dark:bg-sky-950/40 border-sky-100/80 dark:border-sky-800/80 text-[11px] sm:text-xs rounded-2xl px-4 sm:px-5 py-3 sm:py-4 border`}
          >
            <p className="text-slate-600 dark:text-sky-100">
              <span className="font-semibold">Important:</span> This page is a
              general template generated for Passiify and does not constitute
              legal advice. Laws and regulations differ by country and region.
              You should review, customise and approve this content with your
              own legal advisor before using it publicly.
            </p>
          </section>

          {/* Terms body */}
          <section
            className={`bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl ${accentBorder} shadow-[0_22px_80px_rgba(15,23,42,0.65)]`}
          >
            <div className="px-5 sm:px-7 py-6 sm:py-7 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-200 space-y-6">
              {/* 1. Acceptance */}
              <article className="space-y-2">
                <h2 className="text-sm sm:text-base font-semibold">
                  1. Acceptance of Terms
                </h2>
                <p>
                  By accessing or using Passiify (including browsing, creating
                  an account, booking a pass or event, or listing your gym or
                  event as a host), you agree to be bound by these Terms and our
                  Privacy Policy. If you do not agree, you must not use the
                  Platform.
                </p>
                <p>
                  Passiify may update these Terms from time to time. When we do,
                  we will update the &quot;Last updated&quot; date on this page.
                  Your continued use of the Platform after any changes means you
                  accept the updated Terms.
                </p>
              </article>

              {/* 2. Who we are */}
              <article className="space-y-2">
                <h2 className="text-sm sm:text-base font-semibold">
                  2. About Passiify
                </h2>
                <p>
                  Passiify is a discovery and booking platform that connects
                  users with gyms, studios, trainers and event hosts
                  (collectively, &quot;Hosts&quot;). Passiify itself does not
                  own or operate gyms, facilities or events. Each Host is
                  responsible for the services they provide, including safety,
                  quality and adherence to local regulations.
                </p>
                <p>
                  Passiify primarily facilitates: (a) discovery of fitness
                  spaces and events, (b) booking and payments for passes and
                  tickets where enabled, and (c) digital confirmations and basic
                  support.
                </p>
              </article>

              {/* 3. Eligibility */}
              <article className="space-y-2">
                <h2 className="text-sm sm:text-base font-semibold">
                  3. Eligibility &amp; Account
                </h2>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    You must be legally capable of entering into a binding
                    contract under the laws of your jurisdiction (typically 18+
                    years).
                  </li>
                  <li>
                    You agree to provide accurate, complete and current
                    information when creating an account and keep it updated.
                  </li>
                  <li>
                    You are responsible for maintaining the confidentiality of
                    your login credentials and for all activities under your
                    account.
                  </li>
                  <li>
                    Passiify may suspend or terminate your account if we
                    reasonably believe you have violated these Terms or any
                    applicable law.
                  </li>
                </ul>
              </article>

              {/* 4. Bookings & payments */}
              <article className="space-y-2">
                <h2 className="text-sm sm:text-base font-semibold">
                  4. Bookings, Passes &amp; Payments
                </h2>
                <p>
                  When you book a pass or event through Passiify, you are
                  entering into a direct agreement with the Host, and not with
                  Passiify as the service provider.
                </p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    <span className="font-semibold">Pricing:</span> Prices are
                    set by Hosts or by Passiify in collaboration with Hosts and
                    may change at any time. The price at the time of booking is
                    the price that applies.
                  </li>
                  <li>
                    <span className="font-semibold">Taxes &amp; fees:</span>{" "}
                    Where applicable, taxes, platform fees or payment gateway
                    charges may be included or added at checkout. You are
                    responsible for any additional charges or bank fees.
                  </li>
                  <li>
                    <span className="font-semibold">Confirmation:</span> A
                    booking is confirmed when you receive a confirmation screen
                    and/or email, along with a digital pass or ticket (for
                    example, a QR code or booking ID).
                  </li>
                  <li>
                    <span className="font-semibold">
                      Cancellations &amp; refunds:
                    </span>{" "}
                    The cancellation and refund rules for each pass or event
                    will be shown on the listing (for example, &quot;non
                    refundable&quot;, &quot;free cancellation up to X hours
                    before&quot; etc.). Those rules are part of these Terms for
                    that booking.
                  </li>
                </ul>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                  Note: Payment processing may be handled by third-party payment
                  providers. Your use of those services may be subject to their
                  own terms and privacy policies.
                </p>
              </article>

              {/* 5. User responsibilities */}
              <article className="space-y-2">
                <h2 className="text-sm sm:text-base font-semibold">
                  5. User Responsibilities
                </h2>
                <p>
                  By using Passiify and attending any booked session, you agree
                  to:
                </p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    Follow all instructions, rules and safety guidelines
                    provided by Hosts and venue staff.
                  </li>
                  <li>
                    Ensure you are medically and physically fit to participate
                    in the chosen activity. If unsure, consult your doctor
                    before booking.
                  </li>
                  <li>
                    Arrive on time for your session or check-in within the
                    specified window, where applicable.
                  </li>
                  <li>
                    Respect other participants, Hosts and venue property. Any
                    abusive, illegal or disruptive behaviour may lead to
                    cancellation of your booking and/or account.
                  </li>
                </ul>
              </article>

              {/* 6. Health & risk */}
              <article className="space-y-2">
                <h2 className="text-sm sm:text-base font-semibold">
                  6. Health, Assumption of Risk &amp; Disclaimer
                </h2>
                <p>
                  Fitness and wellness activities inherently involve physical
                  exertion and risk. By booking and attending any session
                  through Passiify, you acknowledge and agree that:
                </p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    You participate at your own risk, and you are responsible
                    for determining whether a particular activity is appropriate
                    for your level of health and fitness.
                  </li>
                  <li>
                    Passiify does not provide medical advice, diagnosis,
                    treatment or guarantees of any fitness outcome.
                  </li>
                  <li>
                    Passiify is not liable for any injury, loss, damage or claim
                    arising from your participation in any activity listed on
                    the Platform, except where prohibited by law.
                  </li>
                </ul>
              </article>

              {/* 7. Host responsibilities */}
              <article className="space-y-2">
                <h2 className="text-sm sm:text-base font-semibold">
                  7. Hosts &amp; Third-Party Services
                </h2>
                <p>
                  Hosts are independent third parties and are not employees,
                  agents or partners of Passiify. Hosts are solely responsible
                  for:
                </p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    Accuracy of information displayed on their listings,
                    including schedules, facilities, trainers and pricing.
                  </li>
                  <li>
                    Obtaining and maintaining all necessary licences, permits
                    and insurance required to operate their facility or event.
                  </li>
                  <li>
                    Providing safe equipment, environment and supervision, where
                    applicable.
                  </li>
                </ul>
                <p>
                  Passiify may perform basic verification checks, but we do not
                  guarantee or endorse any specific Host, facility or activity.
                </p>
              </article>

              {/* 8. Acceptable use */}
              <article className="space-y-2">
                <h2 className="text-sm sm:text-base font-semibold">
                  8. Acceptable Use of the Platform
                </h2>
                <p>You agree not to:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    Use Passiify for any illegal purpose or in violation of any
                    law or regulation.
                  </li>
                  <li>
                    Attempt to interfere with or compromise the security or
                    integrity of the Platform.
                  </li>
                  <li>
                    Scrape, copy or reverse engineer any part of the Platform
                    without our written permission.
                  </li>
                  <li>
                    Misrepresent your identity or relationship with any person
                    or entity, including as a Host.
                  </li>
                </ul>
              </article>

              {/* 9. Content & reviews */}
              <article className="space-y-2">
                <h2 className="text-sm sm:text-base font-semibold">
                  9. Content, Reviews &amp; Intellectual Property
                </h2>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    Passiify and/or its licensors own all rights in the Platform
                    design, branding, software and content, except where content
                    is provided by Hosts or users.
                  </li>
                  <li>
                    When you submit reviews, photos or feedback, you grant
                    Passiify a non-exclusive, worldwide, royalty-free licence to
                    use, display and reproduce that content in connection with
                    the Platform.
                  </li>
                  <li>
                    You must only post content that you have the right to share
                    and that is not unlawful, abusive, hateful or infringing
                    upon others&apos; rights.
                  </li>
                </ul>
              </article>

              {/* 10. Limitation of liability */}
              <article className="space-y-2">
                <h2 className="text-sm sm:text-base font-semibold">
                  10. Limitation of Liability
                </h2>
                <p>
                  To the maximum extent permitted by law, Passiify and its
                  founders, employees and partners will not be liable for:
                </p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    Any indirect, incidental, special, consequential or punitive
                    damages; or
                  </li>
                  <li>
                    Any loss of profits, data, goodwill or other intangible
                    losses arising from or relating to your use of the Platform
                    or any services provided by Hosts.
                  </li>
                </ul>
                <p>
                  If we are found liable in connection with your use of the
                  Platform, our total aggregate liability will be limited to the
                  amount you have paid through the Platform in the three (3)
                  months immediately preceding the event giving rise to the
                  claim, to the extent permitted by law.
                </p>
              </article>

              {/* 11. Privacy */}
              <article className="space-y-2">
                <h2 className="text-sm sm:text-base font-semibold">
                  11. Privacy &amp; Data
                </h2>
                <p>
                  Passiify collects and processes personal data in accordance
                  with our Privacy Policy (to be provided on a dedicated page).
                  By using Passiify, you consent to such processing and confirm
                  that all data you provide is accurate.
                </p>
              </article>

              {/* 12. Termination */}
              <article className="space-y-2">
                <h2 className="text-sm sm:text-base font-semibold">
                  12. Suspension &amp; Termination
                </h2>
                <p>
                  Passiify may suspend or terminate your access to the Platform,
                  with or without notice, if:
                </p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    You violate these Terms, applicable law or third-party
                    rights; or
                  </li>
                  <li>
                    We believe such action is reasonably necessary to protect
                    the Platform, Hosts, other users or the public.
                  </li>
                </ul>
              </article>

              {/* 13. Governing law */}
              <article className="space-y-2">
                <h2 className="text-sm sm:text-base font-semibold">
                  13. Governing Law &amp; Dispute Resolution
                </h2>
                <p>
                  These Terms shall be governed by and construed in accordance
                  with the laws of the jurisdiction in which Passiify is
                  registered or primarily operates (to be specified by you),
                  without regard to conflict of law principles.
                </p>
                <p>
                  Any dispute arising from or relating to these Terms or your
                  use of the Platform shall first be attempted to be resolved
                  amicably. If not resolved, disputes shall be subject to the
                  exclusive jurisdiction of the competent courts in such
                  jurisdiction, unless mandatory local laws provide otherwise.
                </p>
              </article>

              {/* 14. Contact */}
              <article className="space-y-2">
                <h2 className="text-sm sm:text-base font-semibold">
                  14. Contact &amp; Support
                </h2>
                <p>
                  If you have questions about these Terms or about a booking,
                  you can contact Passiify support at:
                </p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    <span className="font-semibold">Email:</span>{" "}
                    support@passiify.com (placeholder – update with your real
                    support email)
                  </li>
                  <li>
                    <span className="font-semibold">In-app support:</span> via
                    the Help or Support section where available.
                  </li>
                </ul>
              </article>

              {/* Last updated */}
              <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800/80 text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 flex flex-wrap items-center gap-2 justify-between">
                <span>Last updated: {new Date().getFullYear()}</span>
                <span
                  className="font-medium"
                  style={{
                    backgroundImage: primaryGradient90,
                    WebkitBackgroundClip: "text",
                    color: "transparent",
                  }}
                >
                  Passiify · Move every city
                </span>
              </div>
            </div>
          </section>

          {/* CTA footer: bring user back into product */}
          <section className="mt-8 text-center">
            <button
              type="button"
              onClick={() => navigate("/explore")}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white shadow-[0_22px_80px_rgba(37,99,235,0.9)] hover:scale-[1.03] transition-transform"
              style={{ backgroundImage: primaryGradient }}
            >
              I agree — take me to gyms &amp; events
            </button>
          </section>
        </main>
      </div>
    </div>
  );
};

export default TermsAndConditions;
