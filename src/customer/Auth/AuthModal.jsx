"use client";

import React, { Fragment } from "react";
import { Dialog, Transition } from "@headlessui/react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useLocation } from "@/lib/navigation";
import RegisterForm from "./RegisterForm";
import LoginForm from "./LoginForm";

const AuthModal = ({ handleClose, open }) => {
  const location = useLocation();
  const isLogin = location.pathname === "/login";

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-[80]" onClose={handleClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-200"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-150"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm" aria-hidden="true" />
        </Transition.Child>

        <div className="fixed inset-0 z-[80] flex items-end justify-center p-0 sm:items-center sm:p-4">
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-200"
            enterFrom="opacity-0 translate-y-8 sm:translate-y-0 sm:scale-95"
            enterTo="opacity-100 translate-y-0 sm:scale-100"
            leave="ease-in duration-150"
            leaveFrom="opacity-100 translate-y-0 sm:scale-100"
            leaveTo="opacity-0 translate-y-8 sm:translate-y-0 sm:scale-95"
          >
            <Dialog.Panel className="relative flex max-h-[min(92dvh,720px)] w-full max-w-lg flex-col overflow-hidden rounded-t-3xl border border-line bg-surface shadow-2xl sm:rounded-2xl">
              <div className="flex shrink-0 items-center justify-between border-b border-line px-4 py-3 sm:px-5">
                <Dialog.Title className="text-base font-semibold text-foreground">
                  {isLogin ? "Sign in" : "Create account"}
                </Dialog.Title>
                <button
                  type="button"
                  onClick={handleClose}
                  className="rounded-lg p-2 text-foreground-subtle transition hover:bg-zinc-100 hover:text-foreground"
                  aria-label="Close"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
              <div className="overflow-y-auto overscroll-contain px-4 py-5 sm:px-6 sm:py-6">
                {isLogin ? (
                  <LoginForm compact onClose={handleClose} />
                ) : (
                  <RegisterForm compact onClose={handleClose} />
                )}
              </div>
            </Dialog.Panel>
          </Transition.Child>
        </div>
      </Dialog>
    </Transition.Root>
  );
};

export default AuthModal;
