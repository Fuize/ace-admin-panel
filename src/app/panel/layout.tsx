import Image from "next/image";
import { Sidebar } from "@/components/Sidebar";
import { Topbar } from "@/components/Topbar";
import { AuthProvider } from "@/components/AuthProvider";
import { NotificationProvider } from "@/components/NotificationProvider";
import { StaffChat } from "@/components/StaffChat";
import { UXProvider } from "@/components/UXProvider";
import { CommandPalette } from "@/components/CommandPalette";
import { MobileNavDrawer } from "@/components/MobileNavDrawer";
import { PageTransition } from "@/components/PageTransition";
import webBg from "../../../assets/webbg.png";

export default function PanelLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <UXProvider>
          <div className="relative h-screen overflow-hidden bg-zinc-950 md:flex">
            <Image src={webBg} alt="" fill priority sizes="100vw" className="object-cover opacity-32 scale-[1.01]" />
            <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(3,7,18,.92),rgba(8,11,20,.76)_45%,rgba(3,7,18,.94))]" />
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_70%_18%,rgba(30,41,59,.22),transparent_35%),radial-gradient(circle_at_center,transparent_42%,rgba(0,0,0,.45)_100%)]" />
            <div className="pointer-events-none absolute inset-0 opacity-[.035] [background-image:linear-gradient(rgba(255,255,255,.7)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.55)_1px,transparent_1px)] [background-size:96px_96px]" />
            <div className="relative z-10 contents md:flex">
              <Sidebar />
              <div className="flex h-screen min-w-0 flex-1 flex-col lg:pr-[360px]">
                <Topbar />
                <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">
                  <PageTransition>{children}</PageTransition>
                </main>
              </div>
              <StaffChat />
            </div>
            <CommandPalette />
            <MobileNavDrawer />
          </div>
        </UXProvider>
      </NotificationProvider>
    </AuthProvider>
  );
}
