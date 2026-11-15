import { useState, useEffect } from "react";
import axios from "axios";
import api from "../../api/axios";
import toast from "react-hot-toast";

const AdminSiteSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  const [formData, setFormData] = useState({
    topBarText: "",
    logoUrl: "",
    phone: "",
    whatsapp: "",
    email: "",
    address: "",
    workingHours: "",
    googleMapEmbedUrl: "",
    footerAbout: "",
    copyrightText: "",
    facebookUrl: "",
    instagramUrl: "",
    tiktokUrl: "",
    youtubeUrl: "",
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const { data } = await api.get("/settings");
        setFormData((prev) => ({ ...prev, ...data }));
      } catch (error) {
        toast.error("Failed to load site settings!");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Cloudinary-তে সরাসরি নতুন লোগো আপলোড করার ফাংশন
  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadingLogo(true);
    try {
      const cloudName = "wtbwxhmc";
      const uploadPreset = "dresstown";

      const imgData = new FormData();
      imgData.append("file", file);
      imgData.append("upload_preset", uploadPreset);

      const res = await axios.post(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        imgData
      );

      setFormData((prev) => ({ ...prev, logoUrl: res.data.secure_url }));
      toast.success("Logo uploaded! Click Save Settings to apply.");
    } catch (error) {
      toast.error("Failed to upload logo!");
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/settings", formData);
      toast.success("Website settings updated successfully! 🎉");
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to save settings!");
    } finally {
      setSaving(false);
    }
  };

  const inputClass =
    "w-full border border-gray-300 p-3 text-sm inter-medium focus:border-red-500 focus:outline-none transition-colors bg-white rounded-sm";
  const labelClass =
    "block text-[10px] md:text-[11px] inter-bold text-gray-500 uppercase tracking-widest mb-2";
  const sectionTitleClass =
    "text-sm md:text-[15px] inter-bold text-gray-900 uppercase tracking-widest mb-4 border-b border-gray-200 pb-2";

  if (loading) {
    return (
      <div className="p-10 text-center text-xs inter-bold text-gray-400 uppercase tracking-widest">
        Loading Site Settings...
      </div>
    );
  }

  return (
    <div className="w-full max-w-5xl mx-auto bg-white border border-gray-200 p-6 md:p-8 shadow-sm rounded-sm mb-10">
      <div className="mb-8 border-b border-gray-200 pb-4">
        <h2 className="text-xl md:text-2xl inter-bold text-gray-900 uppercase tracking-widest">
          Site Settings (Navbar, Contact & Footer)
        </h2>
        <p className="text-xs md:text-sm inter-medium text-gray-500 mt-1">
          Manage your brand logo, top announcement bar, contact page details, and footer info from one place.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        {/* --- 1. Navbar Branding & Announcement --- */}
        <div>
          <h3 className={sectionTitleClass}>1. Navbar Logo & Announcement Bar</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
            {/* Logo Upload & Preview */}
            <div className="bg-gray-50 border border-gray-200 p-4 rounded-sm">
              <label className={labelClass}>Website Logo</label>
              <div className="flex items-center gap-4 mb-3">
                <div className="h-16 w-36 bg-white border border-gray-200 flex items-center justify-center p-2 rounded-sm">
                  {formData.logoUrl ? (
                    <img
                      src={formData.logoUrl}
                      alt="Brand Logo"
                      className="max-h-full max-w-full object-contain"
                    />
                  ) : (
                    <span className="text-xs text-gray-400">No Logo</span>
                  )}
                </div>
                <label className="bg-gray-900 hover:bg-red-600 text-white text-[11px] inter-bold uppercase tracking-widest px-4 py-2.5 rounded-sm cursor-pointer transition-colors">
                  {uploadingLogo ? "Uploading..." : "Upload New Logo"}
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    className="hidden"
                    disabled={uploadingLogo}
                  />
                </label>
              </div>
              <input
                type="text"
                name="logoUrl"
                value={formData.logoUrl}
                onChange={handleChange}
                placeholder="Or paste logo image URL directly"
                className={inputClass}
              />
            </div>

            {/* Top Bar Announcement Text */}
            <div>
              <label className={labelClass}>Top Red Bar Text</label>
              <input
                type="text"
                name="topBarText"
                value={formData.topBarText}
                onChange={handleChange}
                placeholder="e.g. Welcome to DressTown | Free Delivery on Orders Over ৳2000"
                className={inputClass}
              />
              <div className="mt-3">
                <span className="block text-[10px] inter-bold text-gray-400 uppercase mb-1">
                  Live Top Bar Preview:
                </span>
                <div className="bg-[#cf141b] text-white text-[11px] uppercase tracking-wider py-2 px-3 rounded-sm">
                  {formData.topBarText || "Welcome to DressTown"}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* --- 2. Contact Information (Contact Page + Footer) --- */}
        <div>
          <h3 className={sectionTitleClass}>2. Contact Page & Business Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className={labelClass}>Phone Number *</label>
              <input
                type="text"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+880 17XX-XXXXXX"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>WhatsApp Number</label>
              <input
                type="text"
                name="whatsapp"
                value={formData.whatsapp}
                onChange={handleChange}
                placeholder="+880 17XX-XXXXXX"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Support Email *</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="support@dresstown.com"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Working Hours</label>
              <input
                type="text"
                name="workingHours"
                value={formData.workingHours}
                onChange={handleChange}
                placeholder="Sat - Thu: 10:00 AM - 10:00 PM"
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Store / Office Address *</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                placeholder="House #..., Road #..., Uttara, Dhaka"
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Google Map Embed URL (Optional - for Contact Page)</label>
              <input
                type="text"
                name="googleMapEmbedUrl"
                value={formData.googleMapEmbedUrl}
                onChange={handleChange}
                placeholder="https://www.google.com/maps/embed?pb=..."
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* --- 3. Footer Info & Social Links --- */}
        <div>
          <h3 className={sectionTitleClass}>3. Footer Content & Social Media Links</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className={labelClass}>Footer Short About Description</label>
              <textarea
                name="footerAbout"
                value={formData.footerAbout}
                onChange={handleChange}
                rows="3"
                className={inputClass}
                placeholder="Short brand bio shown in the footer..."
              />
            </div>
            <div>
              <label className={labelClass}>Facebook Page URL</label>
              <input
                type="text"
                name="facebookUrl"
                value={formData.facebookUrl}
                onChange={handleChange}
                placeholder="https://facebook.com/dresstown"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>Instagram URL</label>
              <input
                type="text"
                name="instagramUrl"
                value={formData.instagramUrl}
                onChange={handleChange}
                placeholder="https://instagram.com/dresstown"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>TikTok URL</label>
              <input
                type="text"
                name="tiktokUrl"
                value={formData.tiktokUrl}
                onChange={handleChange}
                placeholder="https://tiktok.com/@dresstown"
                className={inputClass}
              />
            </div>
            <div>
              <label className={labelClass}>YouTube URL</label>
              <input
                type="text"
                name="youtubeUrl"
                value={formData.youtubeUrl}
                onChange={handleChange}
                placeholder="https://youtube.com/@dresstown"
                className={inputClass}
              />
            </div>
            <div className="md:col-span-2">
              <label className={labelClass}>Footer Copyright Text</label>
              <input
                type="text"
                name="copyrightText"
                value={formData.copyrightText}
                onChange={handleChange}
                placeholder="© 2026 DressTown. All Rights Reserved."
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="pt-6 border-t border-gray-200 flex justify-end">
          <button
            type="submit"
            disabled={saving || uploadingLogo}
            className="bg-red-600 hover:bg-red-700 text-white inter-bold text-xs md:text-sm uppercase tracking-widest px-8 py-4 rounded-sm shadow-md transition-colors cursor-pointer disabled:bg-gray-400"
          >
            {saving ? "Saving All Settings..." : "Save Site Settings"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AdminSiteSettings;