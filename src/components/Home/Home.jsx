import Hero from "../Hero";
import DynamicCategories from "../product/DynamicCategories";
import NewArrivals from "../product/NewArrivals";
import PromoModal from "../product/PromoModal";

const Home = () => {
  return (
    <div>
      <PromoModal/>
      <Hero />
      <NewArrivals/>
      <DynamicCategories/>
    </div>
  );
};

export default Home;