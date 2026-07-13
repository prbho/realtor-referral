import type { Metadata } from "next";
import Footer from "@/components/Footer";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "Regal PDC Realtor",
};

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="bg-slate-50 dark:bg-slate-900 transition-colors duration-200">
      <Header />
      <main className="min-h-full flex flex-col mx-auto max-w-6xl px-0 md:px-6">
        {children}
      </main>
      <Footer />
    </div>
  );
}
