import { cn } from "@/lib/utils";
import { faDateFormatter, faNumberFormatter } from "@/lib/formatters";
import type { UsersTabData } from "@/services/admin/types";
import { updateUserRoleAction } from "@/actions/admin";

export function UsersTab({ data, sessionUserId }: { data: UsersTabData; sessionUserId: string | null }) {
  const { users } = data;

  const totalUsers = users.length;
  const totalAdmins = users.filter((user) => user.role === "ADMIN").length;
  const totalCustomers = totalUsers - totalAdmins;
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const newCustomers30 = users.filter(
    (user) => user.role === "CUSTOMER" && user.createdAt >= thirtyDaysAgo,
  ).length;

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-slate-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-slate-900">مدیریت کاربران</h2>
        <p className="mt-2 text-xs text-slate-500">
          نقش کاربران را کنترل کنید و تصویر دقیقی از رشد کاربران فعال داشته باشید.
        </p>
        <div className="mt-4 flex flex-wrap gap-3 text-xs text-slate-500">
          <span className="rounded-full border border-slate-200 px-4 py-2">
            {faNumberFormatter.format(totalUsers)} کاربر ثبت‌شده
          </span>
          <span className="rounded-full border border-slate-200 px-4 py-2">
            {faNumberFormatter.format(totalAdmins)} مدیر فعال
          </span>
          <span className="rounded-full border border-slate-200 px-4 py-2">
            {faNumberFormatter.format(totalCustomers)} مشتری فعال
          </span>
          <span className="rounded-full border border-slate-200 px-4 py-2">
            {faNumberFormatter.format(newCustomers30)} ثبت‌نام جدید (۳۰ روز اخیر)
          </span>
        </div>
      </section>

      <section className="overflow-hidden rounded-3xl border border-slate-200">
        <table className="min-w-full divide-y divide-slate-200 text-sm text-slate-600">
          <thead className="bg-slate-100 text-xs uppercase text-slate-400">
            <tr>
              <th className="px-4 py-3 text-right">نام</th>
              <th className="px-4 py-3 text-right">ایمیل</th>
              <th className="px-4 py-3 text-right">نقش</th>
              <th className="px-4 py-3 text-right">سفارش‌ها</th>
              <th className="px-4 py-3 text-right">تاریخ عضویت</th>
              <th className="px-4 py-3 text-right">اقدامات</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 bg-slate-50">
            {users.map((user) => {
              const isSelf = sessionUserId === user.id;
              return (
                <tr key={user.id}>
                  <td className="px-4 py-3 text-slate-900">
                    <div className="flex items-center gap-2">
                      <span>{user.name ?? "بدون نام"}</span>
                      {isSelf ? (
                        <span className="rounded-full border border-slate-200 px-2 py-1 text-[10px] text-slate-500">شما</span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-slate-500">{user.email}</td>
                  <td className="px-4 py-3 text-xs text-slate-500">{user.role === "ADMIN" ? "مدیر" : "مشتری"}</td>
                  <td className="px-4 py-3">{faNumberFormatter.format(user.ordersCount)}</td>
                  <td className="px-4 py-3 text-xs text-slate-400">{faDateFormatter.format(user.createdAt)}</td>
                  <td className="px-4 py-3">
                    <form action={updateUserRoleAction} className="flex items-center gap-2">
                      <input type="hidden" name="userId" value={user.id} />
                      <select
                        name="role"
                        defaultValue={user.role}
                        disabled={isSelf}
                        className={cn(
                          "rounded-full border border-slate-200 bg-slate-100 px-3 py-1 text-xs text-slate-700",
                          isSelf && "cursor-not-allowed opacity-50",
                        )}
                      >
                        <option value="CUSTOMER">مشتری</option>
                        <option value="ADMIN">مدیر</option>
                      </select>
                      <button
                        type="submit"
                        disabled={isSelf}
                        title={isSelf ? "امکان تغییر نقش کاربر فعلی وجود ندارد." : "ذخیره نقش"}
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs transition",
                          isSelf
                            ? "cursor-not-allowed border-slate-200 text-slate-300"
                            : "border-sky-200 text-sky-600 hover:border-sky-200 hover:text-slate-900",
                        )}
                      >
                        به‌روزرسانی
                      </button>
                    </form>
                  </td>
                </tr>
              );
            })}
            {!users.length ? (
              <tr>
                <td colSpan={6} className="px-4 py-6 text-center text-xs text-slate-400">
                  هنوز کاربری ثبت نشده است.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </section>
    </div>
  );
}
