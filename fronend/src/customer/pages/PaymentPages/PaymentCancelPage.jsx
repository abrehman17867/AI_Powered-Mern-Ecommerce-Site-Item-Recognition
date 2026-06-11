import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  XCircleIcon,
  ShoppingCartIcon,
  ArrowPathIcon,
  CreditCardIcon,
  ChatBubbleLeftRightIcon,
  HomeIcon,
} from "@heroicons/react/24/outline";
import Button from "../../../components/ui/Button";
import PaymentRecommendations from "./PaymentRecommendations";

const REASONS = [
  {
    title: "You closed the window",
    text: "Stripe checkout was closed before payment finished.",
  },
  {
    title: "Payment was declined",
    text: "Your bank may have declined the charge. Try a different card.",
  },
  {
    title: "Session timed out",
    text: "Checkout sessions expire after a while. Your cart is still saved.",
  },
];

const RETRY_STEPS = [
  { step: "1", title: "Review your cart", text: "Make sure items and quantities are correct." },
  { step: "2", title: "Confirm shipping", text: "Double-check your delivery address." },
  { step: "3", title: "Try payment again", text: "Use Stripe to complete your purchase securely." },
];

const PaymentCancelPage = () => {
  const navigate = useNavigate();

  return (
    <div className="page-section bg-surface">
      <section className="relative overflow-hidden border-b border-line bg-gradient-to-br from-amber-50/80 via-surface to-zinc-50">
        <div className="pointer-events-none absolute -left-16 top-0 h-56 w-56 rounded-full bg-amber-200/40 blur-3xl" />
        <div className="app-container relative py-12 md:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-amber-100 text-amber-600 ring-4 ring-amber-100">
              <XCircleIcon className="h-9 w-9" />
            </span>
            <p className="mt-6 text-xs font-semibold uppercase tracking-[0.2em] text-amber-700">
              Payment not completed
            </p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Checkout was cancelled
            </h1>
            <p className="mt-3 text-base text-foreground-muted sm:text-lg">
              No worries — your cart is safe. You can pick up right where you left off.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button size="lg" className="!px-8" onClick={() => navigate("/cart")}>
                <ShoppingCartIcon className="mr-2 h-5 w-5" />
                Return to cart
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="!px-8"
                onClick={() => navigate("/checkout?step=2")}
              >
                <ArrowPathIcon className="mr-2 h-5 w-5" />
                Try checkout again
              </Button>
            </div>
            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-foreground-muted transition hover:text-brand-600"
            >
              <HomeIcon className="h-4 w-4" />
              Back to home
            </button>
          </div>
        </div>
      </section>

      <section className="app-container py-12 md:py-16">
        <div className="grid gap-10 lg:grid-cols-2 lg:gap-12">
          <div>
            <h2 className="text-xl font-bold text-foreground">Why did this happen?</h2>
            <p className="mt-1 text-sm text-foreground-muted">
              Common reasons checkout doesn&apos;t complete.
            </p>
            <ul className="mt-6 space-y-4">
              {REASONS.map(({ title, text }) => (
                <li
                  key={title}
                  className="flex gap-4 rounded-2xl border border-line bg-surface p-4 shadow-sm"
                >
                  <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-amber-400" />
                  <div>
                    <p className="font-semibold text-foreground">{title}</p>
                    <p className="mt-1 text-sm text-foreground-muted">{text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground">How to complete your order</h2>
            <p className="mt-1 text-sm text-foreground-muted">Three quick steps to try again.</p>
            <ol className="mt-6 space-y-4">
              {RETRY_STEPS.map(({ step, title, text }) => (
                <li
                  key={step}
                  className="flex gap-4 rounded-2xl border border-line bg-gradient-to-r from-surface to-brand-50/20 p-5"
                >
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-500 text-sm font-bold text-white">
                    {step}
                  </span>
                  <div>
                    <p className="font-semibold text-foreground">{title}</p>
                    <p className="mt-1 text-sm text-foreground-muted">{text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <section className="border-y border-line bg-surface-muted/40 py-10">
        <div className="app-container">
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex gap-4 rounded-2xl border border-line bg-surface p-6">
              <CreditCardIcon className="h-8 w-8 shrink-0 text-brand-500" />
              <div>
                <h3 className="font-semibold text-foreground">Secure payments</h3>
                <p className="mt-1 text-sm text-foreground-muted">
                  We use Stripe for encrypted checkout. Your card details are never stored on our
                  servers.
                </p>
              </div>
            </div>
            <div className="flex gap-4 rounded-2xl border border-line bg-surface p-6">
              <ChatBubbleLeftRightIcon className="h-8 w-8 shrink-0 text-brand-500" />
              <div>
                <h3 className="font-semibold text-foreground">Still stuck?</h3>
                <p className="mt-1 text-sm text-foreground-muted">
                  Our team can help with payment issues.{" "}
                  <Link to="/contact-us" className="font-semibold text-brand-600 hover:text-brand-700">
                    Get in touch
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <PaymentRecommendations
        title="Still interested?"
        description="These items are popular with shoppers like you."
      />
    </div>
  );
};

export default PaymentCancelPage;
