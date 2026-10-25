import { Greeting } from "@/components/chat/Greeting";
import { HomeComposer } from "@/components/chat/HomeComposer";
import { HexBadgeLoader } from "@/components/scene/HexBadgeLoader";
import { DotField } from "@/components/ui/DotField";
import { Glow } from "@/components/ui/Glow";

/** New-chat screen: 3D logo over a dot field, greeting and the composer. */
export function ChatHome({ name }: { name: string }) {
  return (
    <div className="relative flex min-h-0 flex-1 flex-col items-center justify-center overflow-hidden px-4 pb-16 app:px-6">
      <DotField focus="center" />
      <Glow className="top-[38%] left-1/2" />
      <div className="relative flex w-full max-w-home flex-col items-center">
        <div className="relative h-48 w-full app:h-60">
          <HexBadgeLoader fill={0.8} />
        </div>
        <Greeting name={name} />
        <div className="mt-9 w-full">
          <HomeComposer />
        </div>
      </div>
    </div>
  );
}
