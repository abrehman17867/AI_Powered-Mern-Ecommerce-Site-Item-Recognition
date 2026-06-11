import React from "react";
import { useNavigate } from "react-router-dom";
import { CameraIcon, SparklesIcon } from "@heroicons/react/24/outline";
import AppContainer from "../../../components/layout/AppContainer";
import Button from "../../../components/ui/Button";
import ButtonPrimary from "../ui/ButtonPrimary";

export default function HomeVisualSearchCta() {
  const navigate = useNavigate();

  return (
    <section className="relative overflow-hidden bg-zinc-950 py-14 md:py-20">
      <div
        className="pointer-events-none absolute -right-24 top-1/2 h-96 w-96 -translate-y-1/2 rounded-full bg-brand-500/20 blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-16 bottom-0 h-64 w-64 rounded-full bg-orange-300/10 blur-3xl"
        aria-hidden
      />
      <AppContainer>
        <div className="relative grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-orange-200">
              <SparklesIcon className="h-4 w-4" aria-hidden />
              AI item recognition
            </p>
            <h2 className="mt-4 font-display text-3xl font-bold tracking-tight text-white md:text-4xl">
              Snap a photo.
              <span className="block text-orange-400">Find it in seconds.</span>
            </h2>
            <p className="mt-4 max-w-lg text-base leading-relaxed text-zinc-400">
              Upload any outfit or accessory image and our visual search matches it
              against thousands of products in your catalog — no keywords required.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonPrimary
                type="button"
                className="!px-8"
                onClick={() => navigate("/products")}
              >
                <CameraIcon className="h-5 w-5" aria-hidden />
                Try visual search
              </ButtonPrimary>
              <Button
                type="button"
                variant="secondary"
                size="lg"
                surface="dark"
                className="border-white/20 bg-white/5 !text-white"
                onClick={() => navigate("/products")}
              >
                Browse catalog
              </Button>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-md lg:max-w-none">
            <div className="rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-sm">
              <div className="overflow-hidden rounded-2xl bg-zinc-900">
                <img
                  src="https://images.pexels.com/photos/6311392/pexels-photo-6311392.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Visual search example"
                  className="aspect-[4/3] w-full object-cover"
                />
              </div>
              <div className="mt-4 flex items-center gap-3 rounded-xl border border-dashed border-white/20 bg-zinc-900/50 px-4 py-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-500/20 text-brand-400">
                  <CameraIcon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-white">Drop an image</p>
                  <p className="text-xs text-zinc-500">JPG, PNG up to 10MB</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </AppContainer>
    </section>
  );
}
