import Hero from "../Hero";
import CategoryBentoGrid from "../product/CategoryBentoGrid";
import DynamicCategories from "../product/DynamicCategories";
import NewArrivals from "../product/NewArrivals";
import PromoModal from "../product/PromoModal";

const Home = () => {
  return (
    <div>
      <PromoModal/>
      <Hero />
      <NewArrivals/>
      <CategoryBentoGrid/>
      <DynamicCategories/>
    </div>
  );
};

export default Home;