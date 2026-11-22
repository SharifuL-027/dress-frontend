import { Helmet } from "react-helmet-async";

const SEO = ({
  title,
  description = "Discover premium men's and women's fashion, polo shirts, jackets, trousers, and exclusive collections at DressTown.",
  image = "https://res.cloudinary.com/dsrs8hryx/image/upload/v1791007439/Sunlit_South_Asian_Family_Portrait_skjr0z.png",
  url,
  type = "website",
  noIndex = false,
}) => {
  const siteTitle = title ? `${title} | DressTown` : "DressTown — Style For Every Story";
  const currentUrl = url || (typeof window !== "undefined" ? window.location.href : "");

  return (
    <Helmet>
      <title>{siteTitle}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      {currentUrl && <link rel="canonical" href={currentUrl} />}

      {/* Open Graph / Facebook / WhatsApp Preview */}
      <meta property="og:type" content={type} />
      <meta property="og:title" content={siteTitle} />
      <meta property="og:description" content={description} />
      {image && <meta property="og:image" content={image} />}
      {currentUrl && <meta property="og:url" content={currentUrl} />}

      {/* Twitter Card */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={siteTitle} />
      <meta name="twitter:description" content={description} />
      {image && <meta name="twitter:image" content={image} />}
    </Helmet>
  );
};

export default SEO;