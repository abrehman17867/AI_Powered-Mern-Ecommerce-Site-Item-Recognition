import React, { useState } from "react";
import AppContainer from "../../../components/layout/AppContainer";
import Button from "../../../components/ui/Button";

export default function HomeNewsletter() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed || !trimmed.includes("@")) {
      setStatus("Enter a valid email address.");
      return;
    }
    setStatus("Thanks — you're on the list!");
    setEmail("");
  };

  return (
    <section className="border-t border-zinc-200/80 bg-surface-muted py-14 md:py-16">
      <AppContainer>
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.2em] text-brand-600">
            Stay in the loop
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold tracking-tight text-zinc-900 md:text-3xl">
            Get drops, deals & style tips
          </h2>
          <p className="mt-3 text-sm text-zinc-600 md:text-base">
            Join our newsletter for early access to sales and new collections.
          </p>
          <form
            onSubmit={handleSubmit}
            className="mx-auto mt-8 flex max-w-md flex-col gap-3 sm:flex-row"
          >
            <label htmlFor="home-newsletter-email" className="sr-only">
              Email address
            </label>
            <input
              id="home-newsletter-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="min-w-0 flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none ring-brand-500/30 transition focus:border-brand-500 focus:ring-2"
            />
            <Button type="submit" variant="primary" size="lg" className="shrink-0 !px-6">
              Subscribe
            </Button>
          </form>
          {status ? (
            <p
              className={`mt-3 text-sm font-medium ${
                status.startsWith("Thanks") ? "text-green-600" : "text-zinc-600"
              }`}
              role="status"
            >
              {status}
            </p>
          ) : (
            <p className="mt-3 text-xs text-zinc-500">
              No spam. Unsubscribe anytime.
            </p>
          )}
        </div>
      </AppContainer>
    </section>
  );
}
