// pages/index.tsx
import * as React from "react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { useRouter } from "next/router";
import { submitOnboarding } from "../lib/api";

export default function AccountPage() {
  const form = useFormContext();
  const { formState } = form;
  const router = useRouter();

  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<string | null>(null);

  const onCreate = form.handleSubmit(async (values) => {
    const ok = await form.trigger(["email", "password"]);
    if (!ok) return;

    try {
      setSaving(true);
      // Persist email+password only (server now allows partial submit)
      await submitOnboarding({
        email: values.email,
        password: values.password,
      });

      setToast("✅ Account saved");
      setTimeout(() => setToast(null), 2000);

      // Move to step 2 (About Me + Address)
      router.replace("/onboarding/2");
    } catch (e: any) {
      setToast(`❌ ${e.message || "Failed to save account"}`);
      setTimeout(() => setToast(null), 2600);
    } finally {
      setSaving(false);
    }
  });

  return (
    <div className="container shell">
      <div className="aura" /><div className="aura a2" />
      <h1 className="header">Create your account</h1>

      <div className="card">
        {/* Simple 3-step hint */}
        <div className="stepper">
          <div className="chip"><span className="num">1</span><span>Account</span></div>
          <div className="chip"><span className="num">2</span><span>About & Address</span></div>
          <div className="chip"><span className="num">3</span><span>Birthdate</span></div>
        </div>

        <form className="grid" onSubmit={onCreate}>
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

          <div style={{ marginTop: 18 }}>
            <button className="button" type="submit" disabled={saving}>
              {saving ? "Saving…" : "Continue →"}
            </button>
          </div>
        </form>
      </div>

      {toast && <div className="toast">{toast}</div>}
    </div>
  );
}
