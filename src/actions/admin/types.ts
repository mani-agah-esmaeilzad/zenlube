export type ActionResult =
  | { success: true }
  | { success: false; message?: string; errors?: Record<string, string[]> };
