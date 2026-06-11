import React, { useEffect, useMemo, useState } from "react";
import {
  MapPinIcon,
  PlusCircleIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import AddressCard from "../AddressCard/AddressCard";
import CheckoutOrderPreview from "./CheckoutOrderPreview";
import { useDispatch, useSelector } from "react-redux";
import { createOrder } from "../../../State/Order/Action";
import { getUser } from "../../../State/Auth/Action";
import { useNavigate } from "react-router-dom";
import Input from "../../../components/ui/Input";
import Button from "../../../components/ui/Button";
import LoadingState from "../../../components/ui/LoadingState";
import { classNames } from "../../../utils/classNames";

const DeliveryAddressForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, isLoading: authLoading } = useSelector((store) => store.auth);
  const { loading: orderLoading, error: orderError } = useSelector((store) => store.order);

  const addressEntries = useMemo(
    () =>
      (user?.address || []).map((item, index) => ({
        key: item._id || `saved-${index}`,
        address: item,
      })),
    [user?.address]
  );

  const [selectedKey, setSelectedKey] = useState(null);
  const [panel, setPanel] = useState("new");

  const busy = orderLoading;

  const selectedAddress = useMemo(
    () => addressEntries.find((e) => e.key === selectedKey)?.address ?? null,
    [addressEntries, selectedKey]
  );

  useEffect(() => {
    const jwt = localStorage.getItem("jwt");
    if (jwt && !user) {
      dispatch(getUser(jwt, { silent: false }));
    }
  }, [dispatch, user]);

  useEffect(() => {
    if (addressEntries.length > 0) {
      if (!selectedKey) setSelectedKey(addressEntries[0].key);
      setPanel("saved");
    }
  }, [addressEntries, selectedKey]);

  const handleDeliverHere = (address) => {
    if (!address || busy) return;
    dispatch(createOrder({ address, navigate }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    handleDeliverHere({
      firstName: data.get("firstName"),
      lastName: data.get("lastName"),
      streetAddress: data.get("address"),
      city: data.get("city"),
      state: data.get("state"),
      zipCode: data.get("zip"),
      mobile: data.get("phoneNumber"),
    });
  };

  if (authLoading && !user) {
    return <LoadingState minHeight="min-h-[24vh]" label="Loading your profile…" />;
  }

  return (
    <div className="relative">
      {busy ? (
        <div
          className="absolute inset-0 z-20 flex items-center justify-center rounded-2xl bg-white/80 backdrop-blur-sm"
          aria-live="polite"
        >
          <LoadingState minHeight="min-h-[12rem]" label="Creating your order…" />
        </div>
      ) : null}

      <div className="mb-6 flex items-center gap-3 rounded-2xl border border-brand-200/60 bg-brand-50/40 px-4 py-3 text-sm text-brand-800">
        <TruckIcon className="h-5 w-5 shrink-0 text-brand-600" />
        <p>Free standard delivery on eligible orders. You&apos;ll review before payment.</p>
      </div>

      <div className="grid gap-8 xl:grid-cols-[1fr_min(18rem)] xl:items-start">
        <div className="min-w-0">
          <div className="mb-6 flex rounded-xl border border-line bg-surface-muted/50 p-1 lg:hidden">
            {addressEntries.length > 0 && (
              <button
                type="button"
                onClick={() => setPanel("saved")}
                className={classNames(
                  "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition",
                  panel === "saved"
                    ? "bg-white text-foreground shadow-sm"
                    : "text-foreground-muted"
                )}
              >
                <MapPinIcon className="h-4 w-4" />
                Saved
              </button>
            )}
            <button
              type="button"
              onClick={() => setPanel("new")}
              className={classNames(
                "flex flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-sm font-semibold transition",
                panel === "new"
                  ? "bg-white text-foreground shadow-sm"
                  : "text-foreground-muted"
              )}
            >
              <PlusCircleIcon className="h-4 w-4" />
              New address
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
            {addressEntries.length > 0 && (
              <section
                className={classNames(
                  "overflow-hidden rounded-2xl border border-line bg-surface shadow-sm",
                  panel !== "saved" && "hidden lg:block"
                )}
              >
                <div className="border-b border-line bg-surface-muted/40 px-5 py-4 sm:px-6">
                  <div className="flex items-center gap-2">
                    <MapPinIcon className="h-5 w-5 text-brand-500" />
                    <div>
                      <h2 className="text-base font-bold text-foreground">Saved addresses</h2>
                      <p className="text-xs text-foreground-muted">
                        Select where we should deliver
                      </p>
                    </div>
                  </div>
                </div>
                <div className="space-y-3 p-5 sm:p-6">
                  <div
                    className="max-h-[22rem] space-y-3 overflow-y-auto pr-1"
                    role="radiogroup"
                    aria-label="Saved addresses"
                  >
                    {addressEntries.map(({ key, address }) => (
                      <AddressCard
                        key={key}
                        address={address}
                        selected={selectedKey === key}
                        disabled={busy}
                        onSelect={() => setSelectedKey(key)}
                      />
                    ))}
                  </div>
                  <Button
                    type="button"
                    className="w-full !py-3"
                    disabled={!selectedAddress || busy}
                    onClick={() => handleDeliverHere(selectedAddress)}
                  >
                    Deliver here
                  </Button>
                </div>
              </section>
            )}

            <section
              className={classNames(
                "overflow-hidden rounded-2xl border border-line bg-surface shadow-sm",
                addressEntries.length > 0 && panel !== "new" && "hidden lg:block",
                addressEntries.length === 0 && "lg:col-span-2"
              )}
            >
              <div className="border-b border-line bg-surface-muted/40 px-5 py-4 sm:px-6">
                <div className="flex items-center gap-2">
                  <PlusCircleIcon className="h-5 w-5 text-brand-500" />
                  <div>
                    <h2 className="text-base font-bold text-foreground">New address</h2>
                    <p className="text-xs text-foreground-muted">
                      Enter delivery details for this order
                    </p>
                  </div>
                </div>
              </div>
              <div className="p-5 sm:p-6">
                {orderError ? (
                  <div
                    className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
                    role="alert"
                  >
                    {orderError}
                  </div>
                ) : null}
                <form className="space-y-4" onSubmit={handleSubmit}>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input label="First name" name="firstName" required autoComplete="given-name" />
                    <Input label="Last name" name="lastName" required autoComplete="family-name" />
                  </div>
                  <Input
                    label="Street address"
                    name="address"
                    required
                    autoComplete="street-address"
                    placeholder="House no., street name"
                  />
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input label="City" name="city" required autoComplete="address-level2" />
                    <Input
                      label="State / region"
                      name="state"
                      required
                      autoComplete="address-level1"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <Input
                      label="ZIP / postal code"
                      name="zip"
                      required
                      autoComplete="postal-code"
                    />
                    <Input
                      label="Phone number"
                      name="phoneNumber"
                      type="tel"
                      required
                      autoComplete="tel"
                    />
                  </div>
                  <Button type="submit" className="w-full !py-3" disabled={busy}>
                    Continue to review
                  </Button>
                </form>
              </div>
            </section>
          </div>
        </div>

        <CheckoutOrderPreview />
      </div>
    </div>
  );
};

export default DeliveryAddressForm;
