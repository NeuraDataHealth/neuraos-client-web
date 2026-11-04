import Markdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import { Text } from "@/components/ui/Text";

/**
 * Maps Markdown to the app's type scale. Raw HTML and images are dropped and
 * unsafe link protocols are removed by react-markdown, so model output can't inject markup.
 */
const components: Components = {
  h1: ({ children }) => <Text as="h3" variant="message-ai-heading" className="text-ink">{children}</Text>,
  h2: ({ children }) => <Text as="h3" variant="message-ai-heading" className="text-ink">{children}</Text>,
  h3: ({ children }) => <Text as="h4" variant="message-ai-subheading" className="text-ink">{children}</Text>,
  h4: ({ children }) => <Text as="h4" variant="message-ai-subheading" className="text-ink">{children}</Text>,
  h5: ({ children }) => <Text as="h4" variant="message-ai-subheading" className="text-ink">{children}</Text>,
  h6: ({ children }) => <Text as="h4" variant="message-ai-subheading" className="text-ink">{children}</Text>,
  p: ({ children }) => <Text variant="message-ai">{children}</Text>,
  ul: ({ children }) => <ul className="flex list-disc flex-col gap-1.5 pl-5 marker:text-muted">{children}</ul>,
  ol: ({ children }) => <ol className="flex list-decimal flex-col gap-1.5 pl-5 marker:text-muted">{children}</ol>,
  li: ({ children }) => (
    <Text as="li" variant="message-ai" className="pl-1 [&>ol]:mt-1.5 [&>p+p]:mt-2 [&>ul]:mt-1.5">
      {children}
    </Text>
  ),
  strong: ({ children }) => <strong className="text-ink">{children}</strong>,
  a: ({ href, children }) => (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-accent underline decoration-accent/40 underline-offset-2 hover:decoration-accent"
    >
      {children}
    </a>
  ),
  blockquote: ({ children }) => (
    <blockquote className="flex flex-col gap-2 border-l-2 border-accent/40 pl-3 text-muted">{children}</blockquote>
  ),
  hr: () => <hr className="border-line" />,
  code: ({ children }) => (
    <Text as="code" variant="mono" className="rounded-xs bg-ink/5 px-1 py-px text-ink">
      {children}
    </Text>
  ),
  pre: ({ children }) => (
    <Text
      as="pre"
      variant="mono"
      className="overflow-x-auto rounded-card bg-ink/4 px-3 py-2.5 text-ink [&_code]:bg-transparent [&_code]:p-0"
    >
      {children}
    </Text>
  ),
  table: ({ children }) => (
    <div className="max-w-full overflow-x-auto rounded-card border border-line">
      <table className="w-full border-collapse text-left [&_tr:last-child>td]:border-b-0">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-ink/4">{children}</thead>,
  th: ({ children }) => (
    <Text as="th" variant="card-title" className="border-b border-line px-3 py-2 text-ink">
      {children}
    </Text>
  ),
  td: ({ children }) => (
    <Text as="td" variant="body-sm" className="border-b border-line px-3 py-2 align-top text-ink-soft">
      {children}
    </Text>
  ),
};

/** An AI answer written in Markdown (GitHub flavour: tables, lists, strikethrough). */
export function AiMarkdown({ text }: { text: string }) {
  return (
    <Markdown remarkPlugins={[remarkGfm]} components={components} skipHtml disallowedElements={["img"]}>
      {text}
    </Markdown>
  );
}
