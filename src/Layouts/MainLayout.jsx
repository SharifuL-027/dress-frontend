import { Outlet } from "react-router";
import Navbar from "../components/Navbar";
import CartDrawer from "../components/Cart/CartDrawyer";
import Footer from "../components/Footer";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />
      <CartDrawer/>
      {/* Outlet holo sekhan theke routing er page gulo render hobe */}
      <main>
        <Outlet /> 
      </main>
      <Footer/>
    </div>
  );
};

export default MainLayout;