"use client";

import { SPECIALTIES } from "@/components/account/options";
import { SearchField } from "@/components/ui/SearchField";
import { SegmentedControl, type Segment } from "@/components/ui/SegmentedControl";
import { Select } from "@/components/ui/Select";

type TableToolbarProps<T extends string> = {
  tabs?: { segments: Segment<T>[]; value: T; onChange: (value: T) => void; label: string };
  query: string;
  onQuery: (query: string) => void;
  placeholder: string;
  specialty?: { value: string; onChange: (value: string) => void };
};

/** Status tabs on the left; search and an optional specialty filter on the right. */
export function TableToolbar<T extends string>({ tabs, query, onQuery, placeholder, specialty }: TableToolbarProps<T>) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
      {tabs && (
        <SegmentedControl<T>
          label={tabs.label}
          segments={tabs.segments}
          value={tabs.value}
          onValueChange={tabs.onChange}
          className="w-full max-w-155"
        />
      )}
      <div className="flex min-w-[min(100%,18.75rem)] flex-1 flex-wrap justify-end gap-2.5">
        <SearchField
          label="Search"
          placeholder={placeholder}
          value={query}
          onChange={(event) => onQuery(event.target.value)}
          className="max-w-85 min-w-50 flex-1"
        />
        {specialty && (
          <Select label="Specialty" value={specialty.value} onChange={(event) => specialty.onChange(event.target.value)}>
            <option value="">All specialties</option>
            {SPECIALTIES.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </Select>
        )}
      </div>
    </div>
  );
}
