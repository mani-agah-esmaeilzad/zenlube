"use client";

import { useActionState } from "react";

import { updateDefaultAddressAction } from "@/actions/account";

type AddressFormProps = {
  fullName?: string | null;
  phone?: string | null;
  address1?: string | null;
  address2?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
};

type FormState = Awaited<ReturnType<typeof updateDefaultAddressAction>>;

const initialState: FormState = { success: false };

export function AddressForm({ fullName, phone, address1, address2, city, province, postalCode }: AddressFormProps) {
  const [state, formAction] = useActionState(updateDefaultAddressAction, initialState);

  return (
    <form action={formAction} className="grid gap-4 md:grid-cols-2 text-sm">
      <div className="md:col-span-2">
        <label className="text-xs text-slate-500">نام گیرنده</label>
        <input
          name="fullName"
          defaultValue={fullName ?? ""}
          className="mt-1 w-full rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-sky-300 focus:outline-none"
          required
        />
        {state?.errors?.fullName?.map((error) => (
          <p key={error} className="mt-1 text-xs text-red-500">
            {error}
          </p>
        ))}
      </div>
      <div>
        <label className="text-xs text-slate-500">شماره موبایل گیرنده</label>
        <input
          name="phone"
          defaultValue={phone ?? ""}
          placeholder="09xxxxxxxxx"
          className="mt-1 w-full rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-sky-300 focus:outline-none"
          required
        />
        {state?.errors?.phone?.map((error) => (
          <p key={error} className="mt-1 text-xs text-red-500">
            {error}
          </p>
        ))}
      </div>
      <div>
        <label className="text-xs text-slate-500">کد پستی</label>
        <input
          name="postalCode"
          defaultValue={postalCode ?? ""}
          className="mt-1 w-full rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-sky-300 focus:outline-none"
          required
        />
        {state?.errors?.postalCode?.map((error) => (
          <p key={error} className="mt-1 text-xs text-red-500">
            {error}
          </p>
        ))}
      </div>
      <div>
        <label className="text-xs text-slate-500">استان</label>
        <input
          name="province"
          defaultValue={province ?? ""}
          className="mt-1 w-full rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-sky-300 focus:outline-none"
          required
        />
        {state?.errors?.province?.map((error) => (
          <p key={error} className="mt-1 text-xs text-red-500">
            {error}
          </p>
        ))}
      </div>
      <div>
        <label className="text-xs text-slate-500">شهر</label>
        <input
          name="city"
          defaultValue={city ?? ""}
          className="mt-1 w-full rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-sky-300 focus:outline-none"
          required
        />
        {state?.errors?.city?.map((error) => (
          <p key={error} className="mt-1 text-xs text-red-500">
            {error}
          </p>
        ))}
      </div>
      <div className="md:col-span-2">
        <label className="text-xs text-slate-500">آدرس اصلی</label>
        <input
          name="address1"
          defaultValue={address1 ?? ""}
          className="mt-1 w-full rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-sky-300 focus:outline-none"
          required
        />
        {state?.errors?.address1?.map((error) => (
          <p key={error} className="mt-1 text-xs text-red-500">
            {error}
          </p>
        ))}
      </div>
      <div className="md:col-span-2">
        <label className="text-xs text-slate-500">جزئیات تکمیلی</label>
        <input
          name="address2"
          defaultValue={address2 ?? ""}
          className="mt-1 w-full rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-700 focus:border-sky-300 focus:outline-none"
        />
      </div>
      {state?.message && (
        <p className={`md:col-span-2 text-xs ${state.success ? "text-emerald-600" : "text-red-500"}`}>{state.message}</p>
      )}
      <div className="md:col-span-2">
        <button
          type="submit"
          className="w-full rounded-full bg-purple-500 px-5 py-2 text-sm font-semibold text-white transition hover:bg-purple-400"
        >
          ذخیره آدرس
        </button>
      </div>
    </form>
  );
}
