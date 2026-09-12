/** Remove old import-process copy without changing the merchant's product facts. */
export function cleanProductDescription(description?: string | null) {
  return (description ?? "")
    .replace(/این رکورد برای بسته[^.\n]*ساخته شده و تصویر آن از محصول واقعی همین خانواده انتخاب شده است\.?/g, "")
    .replace(/این رکورد مخصوص بسته/g, "این نسخه مخصوص بسته")
    .replace(/بنابراین این رکورد با نسخه/g, "بنابراین این محصول با نسخه")
    .replace(/[ \t]{2,}/g, " ")
    .trim();
}
