import { clsx } from "clsx";
import NextLink from "next/link";
import type { ReactNode } from "react";
import { EmptyState } from "@/components/ui/EmptyState";
import type { IconName } from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/Skeleton";
import { Text } from "@/components/ui/Text";

export type DataRow = {
  key: string;
  /** Opens the row (review page); or `onOpen` for in-page detail (user drawer). */
  href?: string;
  onOpen?: () => void;
  /** Accessible name for opening the row. */
  label?: string;
  cells: ReactNode[];
};

type DataTableProps = {
  label: string;
  columns: { header: string; width: string }[];
  /** Below this the table scrolls sideways (design: 880–1220px). */
  minWidth: string;
  rows: DataRow[];
  loading?: boolean;
  empty: { icon: IconName; title: string; description?: string };
  footer?: string;
};

const SKELETON_WIDTHS = ["w-[62%]", "w-[48%]", "w-[56%]", "w-[70%]", "w-[52%]", "w-[40%]"];

/** Admin table (design): mono header, 62px rows that open on click, skeleton rows, empty state, mono footer. */
export function DataTable({ label, columns, minWidth, rows, loading = false, empty, footer }: DataTableProps) {
  const grid = { gridTemplateColumns: columns.map((c) => c.width).join(" ") };
  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-panel border border-ink/8 bg-paper shadow-card">
        <div className="overflow-x-auto">
          <div role="table" aria-label={label} aria-busy={loading} style={{ minWidth }}>
            <div role="row" style={grid} className="grid h-11 items-center gap-4 border-b border-ink/7 bg-table-head px-5">
              {columns.map((c) => (
                <Text key={c.header} as="span" role="columnheader" variant="table-head" className="whitespace-nowrap text-muted">
                  {c.header}
                </Text>
              ))}
            </div>
            {loading
              ? Array.from({ length: 6 }, (_, i) => (
                  <div key={i} role="row" style={grid} className="grid h-15.5 items-center gap-4 border-b border-ink/6 px-5">
                    {columns.map((c, j) => (
                      <span key={c.header} role="cell" className="flex items-center gap-2.5">
                        {j === 0 && <Skeleton shape="circle" />}
                        <Skeleton className={SKELETON_WIDTHS[j % SKELETON_WIDTHS.length]} />
                      </span>
                    ))}
                  </div>
                ))
              : rows.map((row) => (
                  <div
                    key={row.key}
                    role="row"
                    style={grid}
                    className={clsx(
                      "relative grid min-h-15.5 items-center gap-4 border-b border-ink/7 px-5 py-2.5 last:border-b-0",
                      (row.href || row.onOpen) && "transition-colors duration-(--duration-row) hover:bg-callout",
                    )}
                  >
                    {row.cells.map((cell, i) => (
                      <div key={i} role="cell" className="flex min-w-0 items-center">
                        {i === 0 && row.href ? (
                          <NextLink href={row.href} aria-label={row.label} className="min-w-0 after:absolute after:inset-0">
                            {cell}
                          </NextLink>
                        ) : i === 0 && row.onOpen ? (
                          <button
                            type="button"
                            onClick={row.onOpen}
                            aria-label={row.label}
                            className="min-w-0 cursor-pointer text-left after:absolute after:inset-0"
                          >
                            {cell}
                          </button>
                        ) : (
                          cell
                        )}
                      </div>
                    ))}
                  </div>
                ))}
          </div>
        </div>
        {!loading && rows.length === 0 && <EmptyState {...empty} />}
      </div>
      {!loading && footer && (
        <Text variant="mono-sm" className="px-1 text-faint">
          {footer}
        </Text>
      )}
    </div>
  );
}
