import { ReferralCapture } from "@/components/account/ReferralCapture";
import { ScrollEffects } from "@/components/motion/ScrollEffects";
import { SmoothScroll } from "@/components/motion/SmoothScroll";
import { LaunchToast } from "@/components/parts/LaunchToast";
import { Backdrop } from "@/components/ui/Backdrop";

/** Landing page chrome: backdrop, smooth scroll, scroll effects and the launch toast. */
export default function MarketingLayout({ children }: LayoutProps<"/">) {
  return (
    <>
      <Backdrop />
      <ScrollEffects />
      <SmoothScroll />
      {children}
      <LaunchToast />
      <ReferralCapture />
    </>
  );
}
