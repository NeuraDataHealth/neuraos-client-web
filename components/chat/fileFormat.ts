/** "PDF", "PNG", "JPEG" from a MIME type. */
export function fileKind(mimeType: string): string {
  return (mimeType.split("/")[1] ?? mimeType).toUpperCase();
}
