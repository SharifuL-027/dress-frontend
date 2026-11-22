import { createBrowserRouter } from "react-router";
import SEO from "../components/Seo/SEO";
import MainLayout from "../Layouts/MainLayout";
import Home from "../components/Home/Home";
import AdminRoute from "../components/AdminRoute"; 
import AdminDashboard from "../components/admin/AdminDashboard"; 
import Login from "../components/LogReg/Login";
import Register from "../components/LogReg/Register";
import Profile from "../components/user/Profile";
import AdminLayout from "../components/admin/AdminLayout";
import AdminAddProduct from "../components/admin/AdminAddProduct";
import AdminProducts from "../components/admin/AdminProducts";
import AdminEditProduct from "../components/admin/AdminEditProduct";
import AdminCategories from "../components/admin/AdminCategories";
import AdminOrders from "../components/admin/AdminOrders";
import AdminCustomers from "./../components/admin/AdminCustomers";
import ProductDetails from "../components/product/ProductDetails";
import CategoryPage from "../components/product/CategoryPage";
import WishlistPage from "../components/Cart/WishlistPage";
import CheckoutPage from "../components/Cart/CheckoutPage";
import MyOrdersPage from "../components/Cart/MyOrderspage";
import NewArrivalsPage from "../components/product/NewArrivalsPage";
import AdminBanners from "../components/admin/AdminBanners";
import Shop from "../components/product/Shop";
import AdminSettings from "../components/admin/AdminSettings";
import ContactPage from "../components/contact/ContactPage";
import OrderDetailsPage from "../components/Cart/OrdersDetailsPage";
import AdminSiteSettings from "../components/admin/AdminSiteSettings";


const withSEO = (element, seoProps) => (
  <>
    <SEO {...seoProps} />
    {element}
  </>
);

const router = createBrowserRouter([
  // 1. PUBLIC & CUSTOMER ROUTES (Navbar ebong Footer soho)
  {
    path: "/",
    element: <MainLayout />, 
    children: [
      {
        path: "/",
        element: withSEO(<Home />, {
          title: "Home",
          description: "Shop the latest men's & women's fashion, polo t-shirts, shirts, jackets, and exclusive collections at DressTown.",
        }), 
      },
      {
        path: "/login",
        element: withSEO(<Login />, {
          title: "Login",
          description: "Sign in to your DressTown account to manage orders and wishlist.",
          noIndex: true,
        }),
      },
      {
        path: "/register",
        element: withSEO(<Register />, {
          title: "Create Account",
          description: "Join DressTown today for exclusive fashion deals and faster checkout.",
          noIndex: true,
        }),
      },
      {
        path: "/profile",
        element: withSEO(<Profile />, {
          title: "My Profile",
          noIndex: true,
        }),
      },
      {
        path: "/product/:id", 
        element: <ProductDetails />, // এটির ভেতরে ডাইনামিক প্রোডাক্ট নাম ও ছবি সেট হবে
      },
      {
        path: "/category/:slug",
        element: <CategoryPage />, // এটির ভেতরে ডাইনামিক ক্যাটাগরি নাম সেট হবে
      },
      {
        path: "/wishlist",
        element: withSEO(<WishlistPage />, {
          title: "My Wishlist",
          noIndex: true,
        }),
      },
      {
        path: "/checkout",
        element: withSEO(<CheckoutPage />, {
          title: "Checkout",
          noIndex: true,
        }),
      },
      {
        path: "/my-orders",
        element: withSEO(<MyOrdersPage />, {
          title: "My Orders",
          noIndex: true,
        }),
      },
      {
        path: "/order/:id",
        element: withSEO(<OrderDetailsPage />, {
          title: "Order Details",
          noIndex: true,
        }), 
      }, 
      {
        path: "/new-arrivals",
        element: withSEO(<NewArrivalsPage />, {
          title: "New Arrivals",
          description: "Explore the newest fashion arrivals and latest seasonal collections at DressTown.",
        }),
      },
      {
        path: "/shop",
        element: withSEO(<Shop />, {
          title: "Shop All Collections",
          description: "Browse all premium clothing, outfits, and accessories available at DressTown.",
        }),
      },
      {
        path: "/contact",
        element: withSEO(<ContactPage />, {
          title: "Contact Us",
          description: "Get in touch with DressTown customer support for inquiries, orders, and assistance.",
        }),
      },
    ],
  },
  
  // 2. ADMIN PRIVATE ROUTES
  {
    element: <AdminRoute />, 
    children: [ 
      {
        element: withSEO(<AdminLayout />, {
          title: "Admin Panel",
          noIndex: true,
        }), 
        children: [
          {
            path: "/admin/dashboard",
            element: withSEO(<AdminDashboard />, { title: "Admin Dashboard", noIndex: true }),
          },
          { path: "/admin/add-product", element: withSEO(<AdminAddProduct />, { title: "Add Product", noIndex: true }) },
          { path: "/admin/products", element: withSEO(<AdminProducts />, { title: "Manage Products", noIndex: true }) },
          { path: "/admin/edit-product/:id", element: withSEO(<AdminEditProduct />, { title: "Edit Product", noIndex: true }) },
          { path: "/admin/categories", element: withSEO(<AdminCategories />, { title: "Manage Categories", noIndex: true }) },
          { path: "/admin/orders", element: withSEO(<AdminOrders />, { title: "Manage Orders", noIndex: true }) },
          { path: "/admin/users", element: withSEO(<AdminCustomers />, { title: "Customers", noIndex: true }) },
          { path: "/admin/banners", element: withSEO(<AdminBanners />, { title: "Manage Banners", noIndex: true }) },
          { path: "/admin/settings", element: withSEO(<AdminSettings />, { title: "Admin Settings", noIndex: true }) },
          { path: "/admin/allsettings", element: withSEO(<AdminSiteSettings />, { title: "Site Settings", noIndex: true }) },
        ]
      }
    ]
  }
]);

export default router;