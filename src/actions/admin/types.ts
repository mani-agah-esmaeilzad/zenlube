export type ActionResult =
  | { success: true; message?: string }
  | { success: false; message?: string; errors?: Record<string, string[]> };
