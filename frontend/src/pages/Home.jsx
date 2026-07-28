import Hero from "@/components/site/Hero";
import Categories from "@/components/site/Categories";
import ServiceStrip from "@/components/site/ServiceStrip";
import NewArrivalsAndAside from "@/components/site/NewArrivalsAndAside";
import BestSellersAndFeed from "@/components/site/BestSellersAndFeed";
import TrustStrip from "@/components/site/TrustStrip";

export default function Home() {
  return (
    <div data-testid="home-page">
      <Hero />
      <Categories />
      <ServiceStrip />
      <NewArrivalsAndAside />
      <BestSellersAndFeed />
      <TrustStrip />
    </div>
  );
}
