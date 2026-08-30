"use client";

import { useActionState } from "react";
import { updateProfileAction } from "@/actions/account";
import { isPhoneAccountEmail } from "@/lib/account-email";

type ProfileFormProps = {
  name?: string | null;
  email?: string | null;
  phone?: string | null;
};

type FormState = Awaited<ReturnType<typeof updateProfileAction>>;
const initialState: FormState = { success: false };

export function ProfileForm({ name, email, phone }: ProfileFormProps) {
  const [state, formAction] = useActionState(updateProfileAction, initialState);
  const visibleEmail = isPhoneAccountEmail(email) ? "" : (email ?? "");

  return (
    <form action={formAction} className="grid gap-4 text-sm md:grid-cols-2">
      <Field label="نام و نام خانوادگی" name="name" defaultValue={name ?? ""} errors={state?.errors?.name} />
      <Field label="ایمیل" name="email" type="email" defaultValue={visibleEmail} errors={state?.errors?.email} />
      <Field label="شماره موبایل" name="phone" type="tel" defaultValue={phone ?? ""} errors={state?.errors?.phone} />
      <div className="flex items-end md:justify-end">
        <button type="submit" className="btn-primary !min-h-11 w-full sm:w-auto sm:min-w-36">ذخیره تغییرات</button>
      </div>
      {state?.message && (
        <p className={`border-r-2 px-3 py-2 text-xs font-bold leading-6 md:col-span-2 ${state.success ? "border-green-500 text-[#16A34A]" : "border-red-400 text-[#DC2626]"}`}>
          {state.message}
        </p>
      )}
    </form>
  );
}

function Field({ label, name, defaultValue, type = "text", errors }: { label: string; name: string; defaultValue: string; type?: string; errors?: string[] }) {
  return (
    <label className="text-xs font-bold text-[#374151]">
      {label}
      <input name={name} type={type} defaultValue={defaultValue} className="input-zen mt-2" required />
      {errors?.map((error) => <span key={error} className="mt-1 block text-[11px] text-[#DC2626]">{error}</span>)}
    </label>
  );
}
