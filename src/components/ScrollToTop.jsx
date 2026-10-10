import { useEffect } from "react";
import { useLocation } from "react-router";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // যখনই রাউট (pathname) চেঞ্জ হবে, উইন্ডো অটোমেটিক একদম উপরে চলে যাবে
    window.scrollTo(0, 0);
  }, [pathname]);

  return null; // এটি কোনো UI রেন্ডার করবে না
};

export default ScrollToTop;