"use client";

import { useState } from "react";
import Link from "next/link";
import { SignInButton } from "@/components/auth/sign-in-button";
import { SignOutButton } from "@/components/auth/sign-out-button";

type MobileNavLink = {
  href: string;
  label: string;
  highlight?: boolean;
};

type MobileNavProps = {
  links: MobileNavLink[];
  isAuthenticated: boolean;
};

export function MobileNav({ links, isAuthenticated }: MobileNavProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex items-center lg:hidden">
      <button
        type="button"
        aria-label="باز کردن منوی موبایل"
        className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-black/40 text-white/80 transition hover:border-purple-300 hover:text-white"
        onClick={() => setOpen((prev) => !prev)}
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.6" viewBox="0 0 24 24" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      {open && (
        <div className="absolute left-6 right-6 top-20 z-40 rounded-3xl border border-white/10 bg-[#0f0e1f]/95 p-6 backdrop-blur-lg shadow-2xl">
          <nav className="flex flex-col gap-4 text-sm text-white/80">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-2xl border border-white/10 px-4 py-3 transition hover:border-purple-300 hover:text-white ${
                  link.highlight ? "border-purple-400/40 bg-purple-900/30 text-purple-100" : ""
                }`}
                onClick={() => setOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-6 flex items-center justify-between">
            {isAuthenticated ? <SignOutButton /> : <SignInButton />}
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-full border border-white/15 px-4 py-2 text-xs text-white/60 hover:border-purple-300 hover:text-white"
            >
              بستن
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
