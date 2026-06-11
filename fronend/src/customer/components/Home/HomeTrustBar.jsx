import React from "react";
import {
  ArrowPathIcon,
  CameraIcon,
  ShieldCheckIcon,
  TruckIcon,
} from "@heroicons/react/24/outline";
import AppContainer from "../../../components/layout/AppContainer";
import { TRUST_ITEMS } from "./homeData";

const ICONS = {
  truck: TruckIcon,
  refresh: ArrowPathIcon,
  shield: ShieldCheckIcon,
  camera: CameraIcon,
};

export default function HomeTrustBar() {
  return (
    <section className="border-y border-zinc-200/80 bg-white">
      <AppContainer className="py-8 md:py-10">
        <ul className="grid grid-cols-2 gap-6 md:grid-cols-4 md:gap-8">
          {TRUST_ITEMS.map((item) => {
            const Icon = ICONS[item.icon] || TruckIcon;
            return (
              <li key={item.title} className="flex gap-3 md:gap-4">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                  <Icon className="h-5 w-5" aria-hidden />
                </span>
                <div>
                  <p className="text-sm font-semibold text-zinc-900">{item.title}</p>
                  <p className="mt-0.5 text-xs text-zinc-500 md:text-sm">
                    {item.description}
                  </p>
                </div>
              </li>
            );
          })}
        </ul>
      </AppContainer>
    </section>
  );
}
