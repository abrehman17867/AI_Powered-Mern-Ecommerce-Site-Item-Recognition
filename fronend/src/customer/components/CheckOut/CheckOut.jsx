import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";
import DeliveryAddressForm from "./DeliveryAddressForm";
import { OrderSummary } from "./OrderSummary";
import CartCheckoutStepper from "../Cart/CartCheckoutStepper";
import PageLayout from "../../../components/layout/PageLayout";
import Button from "../../../components/ui/Button";

export default function CheckOut() {
  const location = useLocation();
  const navigate = useNavigate();
  const step = parseInt(new URLSearchParams(location.search).get("step") || "0", 10);
  const isReview = step >= 3;

  const handleBack = () => {
    if (isReview) {
      navigate("/checkout?step=2");
      return;
    }
    navigate("/cart");
  };

  return (
    <PageLayout
      eyebrow="Checkout"
      title={isReview ? "Review & pay" : "Where should we deliver?"}
      description={
        isReview
          ? "Confirm your items and complete payment securely."
          : "Pick a saved address or add a new one. You can review everything before paying."
      }
      actions={
        <Link
          to="/cart"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-600 transition hover:text-brand-700"
        >
          <ArrowLeftIcon className="h-4 w-4" />
          Back to cart
        </Link>
      }
    >
      <CartCheckoutStepper active={isReview ? "review" : "shipping"} />

      {step === 2 && <DeliveryAddressForm />}
      {step === 3 && <OrderSummary />}

      <div className="mt-10 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
        <Button type="button" variant="secondary" onClick={handleBack}>
          <ArrowLeftIcon className="mr-1.5 h-4 w-4" />
          {isReview ? "Edit shipping" : "Back to cart"}
        </Button>
        {step === 2 ? (
          <p className="text-center text-xs text-foreground-subtle sm:text-right">
            Secure checkout · Encrypted payment on the next step
          </p>
        ) : null}
      </div>
    </PageLayout>
  );
}
