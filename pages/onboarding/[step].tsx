// pages/onboarding/[step].tsx
import * as React from "react";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useFormContext } from "react-hook-form";
import { submitOnboarding } from "../../lib/api";
import Address from "../../components/onboarding/Address";
import Birthdate from "../../components/onboarding/Birthdate";
import AboutMe from "../../components/onboarding/AboutMe";

export default function OnboardingStep() {
  const router = useRouter();
  const form = useFormContext();
  const { getValues, formState } = form;

  const raw = Array.isArray(router.query.step) ? router.query.step[0] : router.query.step;
  const step = Math.max(1, Math.min(3, Number(raw) || 1));

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  // simple 3-step progress
  const totalSteps = 3;
  const pct = Math.round(((step - 1) / (totalSteps - 1)) * 100);

  // Route guards: don’t allow jumping to later steps without finishing earlier ones
  useEffect(() => {
    const email = String(getValues("email") ?? "").trim();
    const password = String(getValues("password") ?? "").trim();

    // Steps 2 and 3 require account info → send to "/" (Account page)
    if (step >= 2 && (!email || !password)) {
      router.replace("/");
      return;
    }

    // Step 3 additionally requires a complete address
    if (step === 3) {
      const line1 = String(getValues("Address.line1") ?? "").trim();
      const city  = String(getValues("Address.city") ?? "").trim();
      const state = String(getValues("Address.state") ?? "").trim();
      const zip   = String(getValues("Address.zip") ?? "").trim();
      if (!line1 || !city || !state || !zip) {
        router.replace("/onboarding/2");
        return;
      }
    }
  }, [step, getValues, router]);

  // Next/back with step-specific validation
  async function next() {
    if (step === 1) {
      const ok = await form.trigger(["email", "password"]);
      if (!ok) return;
      return router.push("/onboarding/2");
    }
    if (step === 2) {
      // About Me is optional; Address is required
      const ok = await form.trigger([
        "Address.line1",
        "Address.city",
        "Address.state",
        "Address.zip",
      ]);
      if (!ok) return;
      return router.push("/onboarding/3");
    }
  }
  function back() {
    if (step > 1) router.push(`/onboarding/${step - 1}`);
  }

  // Final submit: validate everything and send
  const onSubmit = form.handleSubmit(async (values) => {
    const ok = await form.trigger([
      "email",
      "password",
      "Address.line1",
      "Address.city",
      "Address.state",
      "Address.zip",
      "Birthdate.date",
    ]);
    if (!ok) {
      // route user back to the first step with outstanding errors
      const email = String(getValues("email") ?? "").trim();
      const password = String(getValues("password") ?? "").trim();
      if (!email || !password) return router.push("/");           // ← go to Account page
      const line1 = String(getValues("Address.line1") ?? "").trim();
      const city  = String(getValues("Address.city") ?? "").trim();
      const state = String(getValues("Address.state") ?? "").trim();
      const zip   = String(getValues("Address.zip") ?? "").trim();
      if (!line1 || !city || !state || !zip) return router.push("/onboarding/2");
      return router.push("/onboarding/3");
    }

    try {
      setSaving(true);
      const pwd = String(values?.password ?? "").trim();
      const payload = {
        email: values?.email ?? "",
        ...(pwd ? { password: pwd } : {}), // include only if present
        AboutMe: values?.AboutMe,          // optional
        Address: values?.Address,          // required on step 2
        Birthdate: values?.Birthdate,      // required on step 3
      };

      await submitOnboarding(payload);
      // ✅ Show Thank You page (no redirect back to step 1)
      router.replace("/success");
    } catch (e: any) {
      setToast(`❌ ${e.message || "Failed to submit"}`);
      setTimeout(() => setToast(null), 2600);
    } finally {
      setSaving(false);
    }
  });

  return (
    <div className="container shell">
      <div className="aura" /><div className="aura a2" />
      <h1 className="header">Onboarding</h1>

      <div className="card">
        {/* Stepper */}
        <div className="stepper">
          <div className="chip"><span className="num">1</span><span>Account</span></div>
          <div className="chip"><span className="num">2</span><span>About & Address</span></div>
          <div className="chip"><span className="num">3</span><span>Birthdate</span></div>
        </div>

        {/* Progress */}
        <div className="progress" aria-label="Progress">
          <div className="progress__bar" style={{ width: `${pct}%` }} />
        </div>
        <span className="progress__label">Step {step} of {totalSteps}</span>

        <form className="grid" onSubmit={onSubmit}>
          {/* STEP 1: Account only */}
          {step === 1 && (
            <section className="section">
              <h2>Account</h2>

              <label className="label" htmlFor="email">Email</label>
              <input
                id="email"
                className="input"
                type="email"
                placeholder="you@example.com"
                {...form.register("email", {
                  required: "Email is required",
                  pattern: { value: /^\S+@\S+$/, message: "Enter a valid email" },
                })}
              />
              {formState.errors?.email && (
                <p className="error">{String(formState.errors.email.message)}</p>
              )}

              <label className="label" htmlFor="password">Password</label>
              <input
                id="password"
                className="input"
                type="password"
                placeholder="••••••••"
                {...form.register("password", {
                  required: "Password is required",
                  minLength: { value: 6, message: "At least 6 characters" },
                })}
              />
              {formState.errors?.password && (
                <p className="error">{String(formState.errors.password.message)}</p>
              )}
            </section>
          )}

          {/* STEP 2: About Me + Address */}
          {step === 2 && (
            <>
              <section className="section">
                <h2>About Me</h2>
                <AboutMe form={form} />
              </section>

              <section className="section">
                <h2>Address</h2>
                <Address form={form} />
              </section>
            </>
          )}

          {/* STEP 3: Birthdate only */}
          {step === 3 && (
            <section className="section">
              <h2>Birthdate</h2>
              <Birthdate form={form} />
            </section>
          )}

          {/* Nav buttons */}
          <div style={{ display: "flex", gap: 10, marginTop: 18 }}>
            {step > 1 && (
              <button type="button" className="button" onClick={back}>
                ← Back
              </button>
            )}
            {step < 3 && (
              <button type="button" className="button" onClick={next}>
                Next →
              </button>
            )}
            {step === 3 && (
              <button className="button" type="submit" disabled={saving}>
                {saving ? "Submitting…" : "Submit"}
              </button>
            )}
          </div>
        </form>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
