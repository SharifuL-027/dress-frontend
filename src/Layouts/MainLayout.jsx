import { Outlet } from "react-router";
import Navbar from "../components/Navbar";
import CartDrawer from "../components/Cart/CartDrawyer";
import Footer from "../components/Footer";
import MobileBottomNav from "../components/MobileBottomNav"; 
import ScrollToTop from "../components/ScrollToTop";

const MainLayout = () => {
  return (
    <div className="min-h-screen bg-white text-gray-900">
      <ScrollToTop/>
      <Navbar />
      <CartDrawer/>
      
      {/* Outlet holo sekhan theke routing er page gulo render hobe */}
      <main>
        <Outlet /> 
      </main>
      
      <Footer/>
      
      {/* মোবাইলের জন্য অ্যাপ-লাইক বটম নেভিগেশন (শুধু মোবাইলেই দেখাবে) */}
      <MobileBottomNav />
    </div>
  );
};

export default MainLayout;