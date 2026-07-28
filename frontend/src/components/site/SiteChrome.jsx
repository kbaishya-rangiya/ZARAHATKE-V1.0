import { Outlet } from "react-router-dom";
import AnnouncementBar from "@/components/site/AnnouncementBar";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import CartSheet from "@/components/site/CartSheet";
import WishlistSheet from "@/components/site/WishlistSheet";

export default function SiteChrome() {
  return (
    <div className="min-h-screen bg-cream-50 text-[#2C1A1D]" data-testid="site-chrome">
      <AnnouncementBar />
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
      <CartSheet />
      <WishlistSheet />
    </div>
  );
}
