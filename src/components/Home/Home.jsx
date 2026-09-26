import Hero from "../Hero";
import DynamicCategories from "../product/DynamicCategories";
import NewArrivals from "../product/NewArrivals";

const Home = () => {
  return (
    <div>
      <Hero />
      <NewArrivals/>
      <DynamicCategories/>
    </div>
  );
};

export default Home;