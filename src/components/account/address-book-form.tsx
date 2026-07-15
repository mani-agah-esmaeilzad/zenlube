"use client";

import { useActionState, useEffect, useRef } from "react";

import { createAddressAction, deleteAddressAction, setDefaultAddressAction } from "@/actions/account";

type FormState = Awaited<ReturnType<typeof createAddressAction>>;

const initialState: FormState = { success: false };

type AddressBookFormProps = {
  addresses: Array<{
    id: string;
    label: string;
    fullName: string;
    phone: string;
    address1: string;
    address2: string | null;
    city: string;
    province: string;
    postalCode: string;
    isDefault: boolean;
  }>;
};

export function AddressBookForm({ addresses }: AddressBookFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, formAction] = useActionState(createAddressAction, initialState);

  useEffect(() => {
    if (state.success) {
      formRef.current?.reset();
    }
  }, [state.success]);

  return (
    <div className="space-y-4">
      <div className="grid gap-3">
        {addresses.length ? (
          addresses.map((address) => (
            <div key={address.id} className="rounded-2xl border border-[#E5E7EB] bg-[#F7F7F8] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-bold text-[#111827]">{address.label}</p>
                    {address.isDefault ? (
                      <span className="rounded-full bg-[#FFF8E8] px-2.5 py-1 text-[11px] font-bold text-[#D97706]">
                        پیش‌فرض
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-xs leading-6 text-[#374151]">
                    {address.fullName} · {address.phone}
                  </p>
                  <p className="text-xs leading-6 text-[#6B7280]">
                    {address.province}، {address.city}، {address.address1}
                    {address.address2 ? `، ${address.address2}` : ""}
                  </p>
                  <p className="text-xs leading-6 text-[#6B7280]">کد پستی: {address.postalCode}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {!address.isDefault ? (
                    <form action={setDefaultAddressAction}>
                      <input type="hidden" name="addressId" value={address.id} />
                      <button type="submit" className="rounded-full border border-[#F5C56B] px-3 py-2 text-xs font-bold text-[#D97706]">
                        پیش‌فرض کن
                      </button>
                    </form>
                  ) : null}
                  <form action={deleteAddressAction}>
                    <input type="hidden" name="addressId" value={address.id} />
                    <button type="submit" className="rounded-full border border-[#FECACA] px-3 py-2 text-xs font-bold text-[#B42318]">
                      حذف
                    </button>
                  </form>
                </div>
              </div>
            </div>
          ))
        ) : (
          <p className="rounded-2xl border border-dashed border-[#E5E7EB] px-4 py-6 text-center text-xs text-[#6B7280]">
            هنوز آدرس دیگری ثبت نشده است.
          </p>
        )}
      </div>

      <form ref={formRef} action={formAction} className="grid gap-4 rounded-3xl border border-dashed border-[#E5E7EB] p-4 text-sm md:grid-cols-2">
        <Field label="عنوان آدرس" name="label" defaultValue="" errors={state?.errors?.label} />
        <Field label="نام گیرنده" name="fullName" defaultValue="" errors={state?.errors?.fullName} />
        <Field label="شماره موبایل" name="phone" defaultValue="" errors={state?.errors?.phone} />
        <Field label="کد پستی" name="postalCode" defaultValue="" errors={state?.errors?.postalCode} />
        <Field label="استان" name="province" defaultValue="" errors={state?.errors?.province} />
        <Field label="شهر" name="city" defaultValue="" errors={state?.errors?.city} />
        <Field label="آدرس اصلی" name="address1" defaultValue="" errors={state?.errors?.address1} wide />
        <Field label="جزئیات تکمیلی" name="address2" defaultValue="" wide required={false} />
        <label className="flex items-center gap-2 text-xs font-bold text-[#374151] md:col-span-2">
          <input type="checkbox" name="setAsDefault" className="size-4 accent-[#F59E0B]" />
          این آدرس به‌عنوان پیش‌فرض ذخیره شود
        </label>
        {state?.message ? (
          <p className={`rounded-2xl px-4 py-3 text-xs font-bold md:col-span-2 ${state.success ? "bg-green-50 text-[#16A34A]" : "bg-red-50 text-[#DC2626]"}`}>
            {state.message}
          </p>
        ) : null}
        <div className="md:col-span-2">
          <button type="submit" className="btn-primary w-full">افزودن آدرس جدید</button>
        </div>
      </form>
    </div>
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
      {errors?.map((error) => (
        <span key={error} className="mt-1 block text-[11px] text-[#DC2626]">
          {error}
        </span>
      ))}
    </label>
  );
}
