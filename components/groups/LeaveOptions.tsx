import { Checkbox } from "@/components/ui/Checkbox";
import { Text } from "@/components/ui/Text";

type LeaveOptionsProps = {
  myFileNames: string[];
  deleteMyFiles: boolean;
  onChange: (deleteMyFiles: boolean) => void;
};

/** "Also delete the files I shared?" on the leave step. Files stay unless ticked (SPEC.md section 9). */
export function LeaveOptions({ myFileNames, deleteMyFiles, onChange }: LeaveOptionsProps) {
  if (myFileNames.length === 0) return null;
  return (
    <div className="rounded-callout border border-ink/8 bg-callout px-4 py-3.5">
      <Checkbox checked={deleteMyFiles} onChange={(event) => onChange(event.target.checked)}>
        <Text as="span" variant="ui-md" className="block">
          Also delete the files I shared
        </Text>
        <Text as="span" variant="body-sm" className="mt-0.75 block text-muted">
          {myFileNames.length} {myFileNames.length === 1 ? "file" : "files"}: {myFileNames.join(", ")}
        </Text>
      </Checkbox>
    </div>
  );
}
