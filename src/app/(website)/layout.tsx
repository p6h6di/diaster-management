import Footer from "./_components/footer";
import Navbar from "./_components/navbar";

export default function WebsiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-[100dvh] grid grid-rows-[auto_1fr_auto] bg-white text-black">
      <Navbar />
      <div className="max-w-6xl md:max-w-5xl mx-auto w-full m-32">
        {children}
      </div>
      <Footer />
    </div>
  );
}
