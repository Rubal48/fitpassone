// src/pages/PrivacyPolicy.jsx
import React, { useEffect, useState } from "react";
import {
  ShieldCheck,
  Lock,
  Globe2,
  Smartphone,
  Mail,
  ArrowLeft,
} from "lucide-react";
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

const PrivacyPolicy = () => {
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
                Privacy & Data
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
                  <Lock className="w-3.5 h-3.5 text-sky-500" />
                  <span className="uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                    How Passiify handles your data
                  </span>
                </div>

                <h1 className="text-xl sm:text-2xl md:text-3xl font-bold tracking-tight">
                  Passiify Privacy Policy
                </h1>

                <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 max-w-2xl">
                  This Privacy Policy explains how Passiify collects, uses and
                  protects your personal information when you discover, book and
                  manage passes and events through our platform. By using
                  Passiify, you agree to the practices described here.
                </p>

                <div className="flex flex-wrap gap-2 text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                    <Globe2 className="w-3.5 h-3.5 text-sky-500" />
                    Applies to Passiify app/website &amp; host discovery
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800">
                    <Smartphone className="w-3.5 h-3.5 text-emerald-500" />
                    Covers account data, bookings and device usage
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Legal note */}
          <section
            className={`mb-8 bg-amber-50/80 dark:bg-amber-950/40 border-amber-100/80 dark:border-amber-800/80 text-[11px] sm:text-xs rounded-2xl px-4 sm:px-5 py-3 sm:py-4 border`}
          >
            <p className="text-slate-700 dark:text-amber-100">
              <span className="font-semibold">Important:</span> This Privacy
              Policy is a general template generated for Passiify and does not
              constitute legal advice. Privacy laws (for example, GDPR or local
              data protection rules) differ by country. You should review and
              customise this policy with your own legal advisor before using it
              publicly.
            </p>
          </section>

          {/* Policy body */}
          <section
            className={`bg-white/95 dark:bg-slate-950/95 backdrop-blur-xl ${accentBorder} shadow-[0_22px_80px_rgba(15,23,42,0.65)]`}
          >
            <div className="px-5 sm:px-7 py-6 sm:py-7 text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-slate-200 space-y-6">
              {/* 1. Scope */}
              <article className="space-y-2">
                <h2 className="text-sm sm:text-base font-semibold">
                  1. Scope of this Policy
                </h2>
                <p>
                  This Privacy Policy applies to all users of Passiify&apos;s
                  platform, including visitors, registered members and Hosts
                  (gyms, studios, trainers and event organisers). It covers
                  information collected through our website, web views and
                  related services (collectively, the &quot;Platform&quot;).
                </p>
              </article>

              {/* 2. Data we collect */}
              <article className="space-y-2">
                <h2 className="text-sm sm:text-base font-semibold">
                  2. Information We Collect
                </h2>
                <p>Depending on how you use Passiify, we may collect:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    <span className="font-semibold">Account details:</span>{" "}
                    name, email address, phone number (if provided), password
                    (stored in encrypted form) and basic profile details.
                  </li>
                  <li>
                    <span className="font-semibold">
                      Booking &amp; usage data:
                    </span>{" "}
                    records of gyms, studios and events you view or book,
                    passes/tickets purchased, dates, times, cities you train in
                    and any preferences (for example, &quot;combat sports&quot;,
                    &quot;yoga&quot;, usual training time).
                  </li>
                  <li>
                    <span className="font-semibold">
                      Host &amp; business data:
                    </span>{" "}
                    for Hosts, we may collect facility details, business
                    documents, address, payout information and content you add
                    to your listings.
                  </li>
                  <li>
                    <span className="font-semibold">
                      Payment-related information:
                    </span>{" "}
                    limited payment metadata such as transaction IDs, payment
                    status, amount and method. Card and bank details are
                    typically processed directly by secure third-party payment
                    gateways and are not stored in plain form by Passiify.
                  </li>
                  <li>
                    <span className="font-semibold">
                      Device &amp; technical data:
                    </span>{" "}
                    device type, operating system, browser type, IP address,
                    approximate location (city/country level), language, and
                    app usage events (e.g., clicks, screens viewed).
                  </li>
                  <li>
                    <span className="font-semibold">
                      Support &amp; communication:
                    </span>{" "}
                    messages you send to Passiify support, feedback, reviews and
                    any other information you choose to share with us.
                  </li>
                </ul>
              </article>

              {/* 3. How we use it */}
              <article className="space-y-2">
                <h2 className="text-sm sm:text-base font-semibold">
                  3. How We Use Your Information
                </h2>
                <p>We use your information to:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    Provide, operate and improve the Platform and its core
                    features (discovery, booking, passes, check-ins).
                  </li>
                  <li>
                    Create and manage your Passiify account, booking history and
                    personalised dashboard.
                  </li>
                  <li>
                    Process bookings and payments, send confirmations, receipts,
                    reminders and updates about your passes and events.
                  </li>
                  <li>
                    Show you relevant gyms, events and content based on your
                    location, preferences and training vibe (for example,
                    combat, yoga, morning sessions).
                  </li>
                  <li>
                    Monitor usage, troubleshoot issues, run analytics and
                    improve the product experience.
                  </li>
                  <li>
                    Detect, investigate and help prevent fraud, abuse and
                    security incidents.
                  </li>
                  <li>
                    Communicate with you about product updates, new features,
                    promotions or surveys — where allowed and with any required
                    consent.
                  </li>
                  <li>
                    Comply with legal obligations and enforce our Terms &amp;
                    Conditions.
                  </li>
                </ul>
              </article>

              {/* 4. Legal bases (optional/neutral) */}
              <article className="space-y-2">
                <h2 className="text-sm sm:text-base font-semibold">
                  4. Legal Bases (Where Applicable)
                </h2>
                <p>
                  In some regions (for example, the European Economic Area),
                  data protection laws require us to explain the legal bases we
                  rely on. Depending on your location, Passiify may process your
                  data based on:
                </p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Performance of a contract (for example, your bookings)</li>
                  <li>Legitimate interests (for example, product improvement)</li>
                  <li>Compliance with legal obligations</li>
                  <li>Your consent (for example, certain marketing activities)</li>
                </ul>
              </article>

              {/* 5. Sharing info */}
              <article className="space-y-2">
                <h2 className="text-sm sm:text-base font-semibold">
                  5. How We Share Your Information
                </h2>
                <p>We do not sell your personal data. We may share it with:</p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    <span className="font-semibold">Hosts:</span> When you book
                    a pass or event, we share relevant details with the Host so
                    they can manage your booking and check-in (for example,
                    name, booking ID, time, number of tickets).
                  </li>
                  <li>
                    <span className="font-semibold">
                      Payment service providers:
                    </span>{" "}
                    to process payments securely, handle refunds, and prevent
                    fraud.
                  </li>
                  <li>
                    <span className="font-semibold">
                      Infrastructure &amp; analytics partners:
                    </span>{" "}
                    companies that help us host the Platform, send emails,
                    analyse usage and improve the product (subject to
                    contractual safeguards).
                  </li>
                  <li>
                    <span className="font-semibold">
                      Legal &amp; compliance:
                    </span>{" "}
                    law enforcement or authorities when required by applicable
                    law, or to protect our rights, users and partners.
                  </li>
                </ul>
              </article>

              {/* 6. Cookies / tracking */}
              <article className="space-y-2">
                <h2 className="text-sm sm:text-base font-semibold">
                  6. Cookies &amp; Similar Technologies
                </h2>
                <p>
                  Passiify may use cookies and similar technologies to remember
                  your preferences, keep you logged in, understand how the
                  Platform is used and measure performance.
                </p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    Essential cookies — required for the Platform to function
                    securely (for example, session and authentication).
                  </li>
                  <li>
                    Preference cookies — remember settings like language, city or
                    theme.
                  </li>
                  <li>
                    Analytics/usage — help us understand which features are
                    used, so we can improve the product.
                  </li>
                </ul>
                <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400">
                  You may be able to control cookies through your browser or
                  device settings. Disabling some cookies may affect the
                  experience of using Passiify.
                </p>
              </article>

              {/* 7. Retention */}
              <article className="space-y-2">
                <h2 className="text-sm sm:text-base font-semibold">
                  7. Data Retention
                </h2>
                <p>
                  We keep your personal data only for as long as necessary for
                  the purposes described in this Policy, including:
                </p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>
                    For as long as you maintain an active Passiify account.
                  </li>
                  <li>
                    For a period after you stop using the Platform, where
                    required for legal, tax or accounting obligations, dispute
                    resolution or fraud prevention.
                  </li>
                </ul>
                <p>
                  When data is no longer needed, we take reasonable steps to
                  delete or de-identify it, in line with applicable laws.
                </p>
              </article>

              {/* 8. Security */}
              <article className="space-y-2">
                <h2 className="text-sm sm:text-base font-semibold">
                  8. Data Security
                </h2>
                <p>
                  We use reasonable technical and organisational measures to
                  protect your information, including encryption in transit for
                  sensitive data, secure hosting environments and access
                  controls.
                </p>
                <p>
                  However, no platform or transmission over the internet is
                  completely secure. We cannot guarantee absolute security, and
                  you use Passiify at your own risk. You are responsible for
                  keeping your login credentials safe and notifying us if you
                  suspect unauthorised access to your account.
                </p>
              </article>

              {/* 9. Your rights */}
              <article className="space-y-2">
                <h2 className="text-sm sm:text-base font-semibold">
                  9. Your Rights &amp; Choices
                </h2>
                <p>
                  Depending on your location and applicable law, you may have
                  the right to:
                </p>
                <ul className="list-disc ml-5 space-y-1">
                  <li>Access the personal data we hold about you.</li>
                  <li>
                    Request correction of inaccurate or incomplete information.
                  </li>
                  <li>
                    Request deletion of your data, subject to legal/legitimate
                    retention requirements.
                  </li>
                  <li>
                    Object to or restrict certain types of processing (for
                    example, direct marketing).
                  </li>
                  <li>
                    Withdraw consent where processing is based on your consent.
                  </li>
                </ul>
                <p>
                  To exercise these rights, or to ask questions about your data,
                  you can contact us using the details in the{" "}
                  <span className="font-semibold">Contact Us</span> section
                  below. We may need to verify your identity before responding.
                </p>
              </article>

              {/* 10. Communications */}
              <article className="space-y-2">
                <h2 className="text-sm sm:text-base font-semibold">
                  10. Communications &amp; Marketing
                </h2>
                <p>
                  We may send you transactional emails/SMS related to your
                  account and bookings (for example, confirmations, reminders,
                  important product notices) — these are necessary to provide the
                  service.
                </p>
                <p>
                  We may also send you product updates, offers or newsletters,
                  where permitted by law and/or based on your consent. You can
                  usually opt out of marketing emails by using the unsubscribe
                  link in the message or updating your preferences.
                </p>
              </article>

              {/* 11. Children */}
              <article className="space-y-2">
                <h2 className="text-sm sm:text-base font-semibold">
                  11. Children&apos;s Privacy
                </h2>
                <p>
                  Passiify is not intended for children below the age at which
                  they can legally provide consent to data processing in their
                  jurisdiction. We do not knowingly collect personal data from
                  children without appropriate parental/guardian consent where
                  required by law.
                </p>
                <p>
                  If you believe we have collected personal data about a child
                  in violation of this Policy, please contact us so we can
                  review and take appropriate action.
                </p>
              </article>

              {/* 12. International transfers */}
              <article className="space-y-2">
                <h2 className="text-sm sm:text-base font-semibold">
                  12. International Data Transfers
                </h2>
                <p>
                  Depending on where you are located and where our servers or
                  service providers operate, your information may be transferred
                  to and processed in countries that may have different data
                  protection laws than your own.
                </p>
                <p>
                  Where required by law, we implement appropriate safeguards for
                  such transfers, such as contractual protections or other
                  mechanisms permitted by applicable regulations.
                </p>
              </article>

              {/* 13. Changes */}
              <article className="space-y-2">
                <h2 className="text-sm sm:text-base font-semibold">
                  13. Changes to this Privacy Policy
                </h2>
                <p>
                  We may update this Privacy Policy from time to time to reflect
                  changes in our practices, technologies, legal requirements or
                  how Passiify works.
                </p>
                <p>
                  When we make material changes, we will update the &quot;Last
                  updated&quot; date below, and may also provide additional
                  notice (for example, a banner or in-app notification). Your
                  continued use of Passiify after any changes means you accept
                  the updated Policy.
                </p>
              </article>

              {/* 14. Contact */}
              <article className="space-y-2">
                <h2 className="text-sm sm:text-base font-semibold">
                  14. Contact Us
                </h2>
                <p>
                  If you have questions or concerns about this Privacy Policy or
                  how Passiify handles your data, you can contact us at:
                </p>
                <ul className="list-disc ml-5 space-y-1">
                  <li className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-sky-500" />
                    <span>
                      <span className="font-semibold">Email:</span>{" "}
                      support@passiify.com (placeholder – replace with your real
                      support email)
                    </span>
                  </li>
                  <li>
                    <span className="font-semibold">In-app support:</span> via
                    the Help/Support section where available.
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

          {/* CTA footer: bounce user back into product */}
          <section className="mt-8 text-center">
            <button
              type="button"
              onClick={() => navigate("/explore")}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full text-xs sm:text-sm font-semibold text-white shadow-[0_22px_80px_rgba(37,99,235,0.9)] hover:scale-[1.03] transition-transform"
              style={{ backgroundImage: primaryGradient }}
            >
              Cool, take me to gyms &amp; events
            </button>
          </section>
        </main>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
