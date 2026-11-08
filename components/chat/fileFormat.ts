import { DOCX_MIME } from "@/lib/limits";

/** "PDF", "PNG", "JPEG", "WEBP", "DOCX" from a MIME type. */
export function fileKind(mimeType: string): string {
  if (mimeType === DOCX_MIME) return "DOCX";
  return (mimeType.split("/")[1] ?? mimeType).toUpperCase();
}
