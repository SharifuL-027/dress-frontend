import { useState, useEffect } from "react";
import api from "../api/axios";

const defaultSettings = {
  topBarText: "Welcome to DressTown",
  logoUrl: "https://res.cloudinary.com/dsrs8hryx/image/upload/v1789818500/DressTown_Logo_Png_oilfhm.png",
  phone: "+880 1700-000000",
  whatsapp: "+880 1700-000000",
  email: "support@dresstown.com",
  address: "Uttara, Dhaka, Bangladesh",
  workingHours: "Saturday - Thursday: 10:00 AM - 10:00 PM",
  googleMapEmbedUrl: "",
  footerAbout: "DressTown — Your trusted destination for premium fashion and lifestyle apparel in Bangladesh.",
  copyrightText: "© 2026 DressTown. All Rights Reserved.",
  facebookUrl: "",
  instagramUrl: "",
  tiktokUrl: "",
  youtubeUrl: "",
};

export const useSiteSettings = () => {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get("/settings");
        if (data) {
          setSettings((prev) => ({ ...prev, ...data }));
        }
      } catch (error) {
        console.error("Failed to fetch site settings:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  return { settings, loading };
};