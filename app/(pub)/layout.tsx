import Footer from "@/components/Footer";
import Header from "@/components/Header";

export default function Layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-neutral-900 transition-colors duration-200">
      <Header />
      <main className="min-h-full flex flex-col">{children}</main>
      <Footer />
    </div>
  );
}
