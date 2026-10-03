import { AppShowcase } from "@/components/sections/AppShowcase";
import { Cores } from "@/components/sections/Cores";
import { Hero } from "@/components/sections/Hero";
import { Privacy } from "@/components/sections/Privacy";
import { SiteNav } from "@/components/sections/SiteNav";

export default function Home() {
  return (
    <>
      <SiteNav />
      <main id="main" className="relative z-1">
        <Hero />
        <Cores />
        <Privacy />
        <AppShowcase />
      </main>
    </>
  );
}
