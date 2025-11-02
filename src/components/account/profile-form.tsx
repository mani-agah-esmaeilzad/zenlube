"use client";

import { useActionState } from "react";

import { updateProfileAction } from "@/actions/account";

type ProfileFormProps = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
};

type FormState = Awaited<ReturnType<typeof updateProfileAction>>;

const initialState: FormState = { success: false };

export function ProfileForm({ name, email, phone }: ProfileFormProps) {
  const [state, formAction] = useActionState(updateProfileAction, initialState);

  return (
    <form action={formAction} className="space-y-4 text-sm">
      <div>
        <label className="text-xs text-slate-500">نام و نام خانوادگی</label>
        <input
          name="name"
          defaultValue={name ?? ""}
          className="mt-1 w-full rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-sky-300 focus:outline-none"
          required
        />
        {state?.errors?.name?.map((error) => (
          <p key={error} className="mt-1 text-xs text-red-500">
            {error}
          </p>
        ))}
      </div>
      <div>
        <label className="text-xs text-slate-500">ایمیل</label>
        <input
          type="email"
          name="email"
          defaultValue={email ?? ""}
          className="mt-1 w-full rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-sky-300 focus:outline-none"
          required
        />
        {state?.errors?.email?.map((error) => (
          <p key={error} className="mt-1 text-xs text-red-500">
            {error}
          </p>
        ))}
      </div>
      <div>
        <label className="text-xs text-slate-500">شماره موبایل</label>
        <input
          type="tel"
          name="phone"
          defaultValue={phone ?? ""}
          placeholder="09xxxxxxxxx"
          className="mt-1 w-full rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-sky-300 focus:outline-none"
        />
        {state?.errors?.phone?.map((error) => (
          <p key={error} className="mt-1 text-xs text-red-500">
            {error}
          </p>
        ))}
      </div>
      {state?.message && (
        <p className={`text-xs ${state.success ? "text-emerald-600" : "text-red-500"}`}>{state.message}</p>
      )}
      <button
        type="submit"
        className="w-full rounded-full bg-sky-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-sky-600"
      >
        ذخیره تغییرات
      </button>
    </form>
  );
}
