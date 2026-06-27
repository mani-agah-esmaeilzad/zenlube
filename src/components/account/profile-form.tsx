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
    <form action={formAction} className="grid gap-4 text-sm md:grid-cols-2">
      <Field label="نام و نام خانوادگی" name="name" defaultValue={name ?? ""} errors={state?.errors?.name} />
      <Field label="ایمیل" name="email" type="email" defaultValue={email ?? ""} errors={state?.errors?.email} />
      <Field label="شماره موبایل" name="phone" type="tel" defaultValue={phone ?? ""} errors={state?.errors?.phone} />
      <div className="flex items-end">
        <button type="submit" className="btn-primary w-full">ذخیره تغییرات</button>
      </div>
      {state?.message && (
        <p className={`md:col-span-2 rounded-2xl px-4 py-3 text-xs font-bold ${state.success ? "bg-green-50 text-[#16A34A]" : "bg-red-50 text-[#DC2626]"}`}>
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
