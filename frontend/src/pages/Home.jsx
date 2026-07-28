import AnnouncementBar from "@/components/site/AnnouncementBar";
import Header from "@/components/site/Header";
import Hero from "@/components/site/Hero";
import Categories from "@/components/site/Categories";
import ServiceStrip from "@/components/site/ServiceStrip";
import NewArrivalsAndAside from "@/components/site/NewArrivalsAndAside";
import BestSellersAndFeed from "@/components/site/BestSellersAndFeed";
import TrustStrip from "@/components/site/TrustStrip";
import Footer from "@/components/site/Footer";
import CartSheet from "@/components/site/CartSheet";
import WishlistSheet from "@/components/site/WishlistSheet";

export default function Home() {
  return (
    <div className="min-h-screen bg-cream-50 text-[#2C1A1D]" data-testid="home-page">
      <AnnouncementBar />
      <Header />
      <main>
        <Hero />
        <Categories />
        <ServiceStrip />
        <NewArrivalsAndAside />
        <BestSellersAndFeed />
        <TrustStrip />
      </main>
      <Footer />
      <CartSheet />
      <WishlistSheet />
    </div>
  );
}
