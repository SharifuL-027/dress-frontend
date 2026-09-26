import { Outlet } from "react-router";
import Navbar from "../components/Navbar";
import CartDrawer from "../components/Cart/CartDrawyer";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <Navbar />
      <CartDrawer/>
      {/* Outlet holo sekhan theke routing er page gulo render hobe */}
      <main>
        <Outlet /> 
      </main>
      {/* Future a ekhane Footer component add hobe */}
    </div>
  );
};

export default MainLayout;