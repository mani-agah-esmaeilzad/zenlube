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
    <form action={formAction} className="grid gap-4 text-sm md:grid-cols-2">
      <Field label="نام گیرنده" name="fullName" defaultValue={fullName ?? ""} errors={state?.errors?.fullName} wide />
      <Field label="شماره موبایل گیرنده" name="phone" defaultValue={phone ?? ""} errors={state?.errors?.phone} />
      <Field label="کد پستی" name="postalCode" defaultValue={postalCode ?? ""} errors={state?.errors?.postalCode} />
      <Field label="استان" name="province" defaultValue={province ?? ""} errors={state?.errors?.province} />
      <Field label="شهر" name="city" defaultValue={city ?? ""} errors={state?.errors?.city} />
      <Field label="آدرس اصلی" name="address1" defaultValue={address1 ?? ""} errors={state?.errors?.address1} wide />
      <Field label="جزئیات تکمیلی" name="address2" defaultValue={address2 ?? ""} wide required={false} />
      {state?.message && (
        <p className={`md:col-span-2 rounded-2xl px-4 py-3 text-xs font-bold ${state.success ? "bg-green-50 text-[#16A34A]" : "bg-red-50 text-[#DC2626]"}`}>
          {state.message}
        </p>
      )}
      <div className="md:col-span-2">
        <button type="submit" className="btn-primary w-full">ذخیره آدرس</button>
      </div>
    </form>
  );
}

function Field({
  label,
  name,
  defaultValue,
  errors,
  wide,
  required = true,
}: {
  label: string;
  name: string;
  defaultValue: string;
  errors?: string[];
  wide?: boolean;
  required?: boolean;
}) {
  return (
    <label className={`text-xs font-bold text-[#374151] ${wide ? "md:col-span-2" : ""}`}>
      {label}
      <input name={name} defaultValue={defaultValue} className="input-zen mt-2" required={required} />
      {errors?.map((error) => <span key={error} className="mt-1 block text-[11px] text-[#DC2626]">{error}</span>)}
    </label>
  );
}
