import "server-only";
import mammoth from "mammoth";
import { PDFDocument } from "pdf-lib";
import { DOCX_MIME, MAX_DOCX_CHARS, MAX_PDF_PAGES, type AllowedMime } from "@/lib/limits";
import { ApiError } from "@/lib/server/http/errors";

/** What the bytes really are, from their signature (the declared type can lie). */
function sniff(bytes: Buffer): AllowedMime | null {
  const ascii = (start: number, end: number) => bytes.subarray(start, end).toString("latin1");
  if (ascii(0, 5) === "%PDF-") return "application/pdf";
  if (bytes[0] === 0x89 && ascii(1, 4) === "PNG") return "image/png";
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
  if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
  if (ascii(0, 4) === "PK\x03\x04") return DOCX_MIME;
  return null;
}

export type InspectedUpload = {
  mimeType: AllowedMime;
  /** Word files only: their text, which extraction reads instead of the file. */
  text: string | null;
};

/**
 * Checks a stored upload before extraction: the bytes match the declared type,
 * a PDF opens without a password and has at most MAX_PDF_PAGES pages, and a Word
 * file converts to text. Throws BAD_FILE with a message the user can act on.
 */
export async function inspectUpload(bytes: Buffer, declared: string): Promise<InspectedUpload> {
  const actual = sniff(bytes);
  if (!actual || actual !== declared) {
    throw new ApiError("BAD_FILE", "The file's contents don't match its type.");
  }

  if (actual === "application/pdf") {
    let pages: number;
    try {
      pages = (await PDFDocument.load(bytes, { updateMetadata: false })).getPageCount();
    } catch {
      throw new ApiError("BAD_FILE", "This PDF can't be opened. Password-protected PDFs aren't supported.");
    }
    if (pages > MAX_PDF_PAGES) throw new ApiError("BAD_FILE", `PDFs can have up to ${MAX_PDF_PAGES} pages.`);
  }

  if (actual === DOCX_MIME) {
    let text: string;
    try {
      text = (await mammoth.extractRawText({ buffer: bytes })).value.trim();
    } catch {
      throw new ApiError("BAD_FILE", "This Word file can't be read. Save it as .docx and try again.");
    }
    if (!text) throw new ApiError("BAD_FILE", "This Word file has no text.");
    return { mimeType: actual, text: text.slice(0, MAX_DOCX_CHARS) };
  }

  return { mimeType: actual, text: null };
}
