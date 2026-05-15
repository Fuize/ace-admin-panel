import Image from "next/image";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { AuthProvider } from "@/components/AuthProvider";
import { StaffChat } from "@/components/StaffChat";
import webBg from "../../../assets/webbg.png";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <div className="relative h-screen overflow-hidden bg-zinc-950 md:flex">
        <Image src={webBg} alt="" fill priority sizes="100vw" className="object-cover opacity-55 scale-[1.01]" />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(2,6,18,.82),rgba(8,11,28,.58)_48%,rgba(2,6,18,.86))]" />
        <div className="ambient-orb pointer-events-none absolute -left-24 top-[-8%] h-[28rem] w-[28rem] rounded-full bg-indigo-500/18 blur-[82px]" />
        <div className="ambient-orb-slow pointer-events-none absolute right-[4%] top-[2%] h-[24rem] w-[24rem] rounded-full bg-sky-400/14 blur-[78px]" />
        <div className="ambient-orb pointer-events-none absolute bottom-[-16%] left-[38%] h-[30rem] w-[30rem] rounded-full bg-fuchsia-500/10 blur-[90px]" />
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_36%,rgba(0,0,0,.42)_100%)]" />
        <div className="pointer-events-none absolute inset-0 opacity-[.09] [background-image:radial-gradient(rgba(255,255,255,.72)_1px,transparent_1px)] [background-size:72px_72px]" />
        <div className="relative z-10 contents md:flex">
          <Sidebar />
          <div className="flex h-screen min-w-0 flex-1 flex-col lg:pr-[360px]">
            <Topbar />
            <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">{children}</main>
          </div>
          <StaffChat />
        </div>
      </div>
    </AuthProvider>
  );
}
