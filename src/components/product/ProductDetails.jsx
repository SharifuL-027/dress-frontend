import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router"; 
import api from "../../api/axios"; 
import toast from "react-hot-toast";
import { useCart } from "../../context/CartContext"; 
import ProductCard from "./ProductCard";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart(); 
  
  const [product, setProduct] = useState(null);
  const [relatedProducts, setRelatedProducts] = useState([]); 
  const [loading, setLoading] = useState(true);

  // Cart States
  const [qty, setQty] = useState(1);
  const [selectedSize, setSelectedSize] = useState("");
  const [selectedColor, setSelectedColor] = useState("");

  // Gallery, Video & Modal States
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);
  const [zoomStyle, setZoomStyle] = useState({ transform: "scale(1)" });

  useEffect(() => {
    const fetchProductData = async () => {
      try {
        const { data } = await api.get(`/api/products/${id}`);
        setProduct(data);
        
        if (data.colors?.length > 0) setSelectedColor(data.colors[0]);
        if (data.sizes?.length > 0) setSelectedSize(data.sizes[0]);

        const categoryId = data.category?._id || data.category;
        if (categoryId) {
          const relatedRes = await api.get('/api/products');
          const allProducts = relatedRes.data.products || relatedRes.data;
          
          const filteredRelated = allProducts.filter(p => 
            (p.category?._id === categoryId || p.category === categoryId) && p._id !== data._id
          ).slice(0, 4);
          
          setRelatedProducts(filteredRelated);
        }

      } catch (error) {
        toast.error("Failed to load product details!");
      } finally {
        setLoading(false);
      }
    };
    
    window.scrollTo(0, 0);
    fetchProductData();
  }, [id]);

  // Gallery Handlers
  const openModal = (index) => { setActiveImageIndex(index); setIsModalOpen(true); document.body.style.overflow = "hidden"; };
  const closeModal = () => { setIsModalOpen(false); document.body.style.overflow = "auto"; };
  const nextImage = (e) => { e.stopPropagation(); setActiveImageIndex((prev) => (prev === product.images.length - 1 ? 0 : prev + 1)); };
  const prevImage = (e) => { e.stopPropagation(); setActiveImageIndex((prev) => (prev === 0 ? product.images.length - 1 : prev - 1)); };
  
  const handleMouseMove = (e) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%`, transform: "scale(2.5)" });
  };
  const handleMouseLeave = () => { setZoomStyle({ transform: "scale(1)", transformOrigin: "center center" }); };

  // ==========================================
  // DYNAMIC STOCK CALCULATOR
  // ==========================================
  const getCurrentStock = () => {
    if (!product) return 0;
    if (product.variants?.length > 0 && selectedColor && selectedSize) {
      const variant = product.variants.find(
        v => v.color.toLowerCase() === selectedColor.toLowerCase() && 
             v.size.toLowerCase() === selectedSize.toLowerCase()
      );
      return variant ? variant.stock : 0;
    }
    return product.totalStock || 0;
  };

  const currentVariantStock = getCurrentStock();
  const variantLabel = `${selectedColor} ${selectedSize}`.trim();
  const stockMessage = currentVariantStock > 0 
    ? (variantLabel ? `${currentVariantStock} In Stock for ${variantLabel}` : `${currentVariantStock} In Stock`)
    : (variantLabel ? `Sorry, ${variantLabel} is Out of Stock` : `Out of Stock`);


  // Quantity Change Handler
  const handleQtyChange = (type) => {
    if (type === 'increment') {
      if (qty < currentVariantStock) setQty(prev => prev + 1);
      else toast.error(`Only ${currentVariantStock} items available for ${variantLabel}!`);
    } else {
      if (qty > 1) setQty(prev => prev - 1);
    }
  };

  // ==========================================
  // ACTION HANDLER (Cart & Checkout)
  // ==========================================
  const handleAction = (type) => {
    if (currentVariantStock === 0) return toast.error(`Sorry, ${variantLabel} is out of stock!`);
    if (product.sizes?.length > 0 && !selectedSize) return toast.error("Please select a size");
    if (product.colors?.length > 0 && !selectedColor) return toast.error("Please select a color");
    if (qty > currentVariantStock) return toast.error(`We only have ${currentVariantStock} left for ${variantLabel}.`);

    const cartItem = {
      ...product,
      price: product.discountPrice || product.regularPrice || product.price || 0,
      qty: qty,
      size: selectedSize || 'Standard',
      color: selectedColor || 'Default',
      maxStock: currentVariantStock
    };

    addToCart(cartItem);
    if (type === 'buy') navigate('/checkout');
  };

  // ==========================================
  // AUTO SIZE CHART TABLE RENDERER (SMART)
  // ==========================================
  const renderSizeChart = (chartText) => {
    if (!chartText) return null;
    
    const lines = chartText.split('\n').map(l => l.trim()).filter(l => l !== '');
    if (lines.length === 0) return null;

    let delimiter = null;
    if (lines.some(l => l.includes('|'))) delimiter = '|';
    else if (lines.some(l => l.includes(','))) delimiter = ',';

    if (!delimiter) {
      return <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap break-words inter-regular">{chartText}</div>;
    }

    const parsedRows = lines.map(line => {
      let cleanLine = line;
      if (delimiter === '|' && cleanLine.startsWith('|')) cleanLine = cleanLine.substring(1);
      if (delimiter === '|' && cleanLine.endsWith('|')) cleanLine = cleanLine.slice(0, -1);
      return cleanLine.split(delimiter).map(cell => cell.trim());
    }).filter(row => {
      const isSeparator = row.every(cell => cell.replace(/-/g, '').trim() === '');
      return !isSeparator && row.some(cell => cell !== '');
    });

    if (parsedRows.length < 2) {
      return <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap break-words inter-regular">{chartText}</div>;
    }

    const headers = parsedRows[0];
    const dataRows = parsedRows.slice(1);

    return (
      <div className="overflow-x-auto border border-gray-200 mt-2 bg-white shadow-sm">
        <table className="w-full text-left border-collapse text-[12px]">
          <thead>
            <tr className="bg-gray-100 text-gray-800 inter-bold uppercase tracking-wider">
              {headers.map((h, i) => (
                <th key={i} className="p-4 border-b border-gray-200 whitespace-nowrap">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {dataRows.map((row, rIdx) => (
              <tr key={rIdx} className="hover:bg-gray-50 transition-colors">
                {row.map((cell, cIdx) => (
                  <td key={cIdx} className={`p-4 border-b border-gray-100 ${cIdx === 0 ? 'inter-bold text-gray-900' : 'text-gray-600 inter-medium'}`}>
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  if (loading) return <div className="p-8 text-center inter-bold text-gray-500 uppercase tracking-widest mt-20">Loading...</div>;
  if (!product) return <div className="p-8 text-center inter-bold text-red-500 uppercase tracking-widest mt-20">Product Not Found!</div>;

  const images = product.images?.length > 0 ? product.images : [{ url: "https://via.placeholder.com/600" }];
  const currentPrice = product.discountPrice || product.regularPrice;

  // Check if any specifications exist
  const hasSpecifications = product.brand || product.fabric || product.gsm || product.fitType || product.sleeveType || product.pattern;

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 mt-4 md:mt-30 mb-20 inter-regular text-gray-800">
      
      {/* ---------------- BREADCRUMB ---------------- */}
      <div className="mb-6 flex flex-wrap items-center text-[10px] inter-bold text-gray-400 uppercase tracking-widest gap-2">
        <Link to="/" className="hover:text-gray-800 transition-colors">Home</Link> 
        <span>/</span>
        {product.gender && product.gender.toLowerCase() !== product.category?.name?.toLowerCase() && (
          <><span>{product.gender}</span><span>/</span></>
        )}
        {product.category?.name && (
          <><span className="text-gray-600">{product.category.name}</span><span>/</span></>
        )}
        
        {product.subCategory && (
          <>
            <span className="text-gray-600">
              {product.subCategory.name || product.subCategory}
            </span>
            <span>/</span>
          </>
        )}
        
        <span className="text-gray-900">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        
        {/* ---------------- LEFT: Image Gallery ---------------- */}
        <div className="lg:col-span-7 flex flex-col gap-4 sticky top-4 self-start">
          <div className="w-full aspect-square border border-gray-200 bg-gray-50 cursor-zoom-in overflow-hidden relative group" onClick={() => openModal(activeImageIndex)}>
            <img src={images[activeImageIndex].url} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 bg-white text-black text-[10px] inter-bold uppercase tracking-widest px-4 py-2 shadow-sm transition-opacity">Click to Zoom</span>
            </div>
          </div>

          <div className="grid grid-cols-5 md:grid-cols-6 gap-3">
            {images.map((img, idx) => (
              <button key={idx} onClick={() => setActiveImageIndex(idx)} className={`aspect-square border transition-all ${activeImageIndex === idx ? 'border-gray-900 shadow-sm' : 'border-gray-200 opacity-60 hover:opacity-100 hover:border-gray-400'}`}>
                <img src={img.url} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
            {product.video?.url && (
              <button onClick={() => setIsVideoModalOpen(true)} className="aspect-square border border-gray-200 opacity-80 hover:opacity-100 bg-gray-100 flex flex-col items-center justify-center gap-1 transition-all">
                <span className="text-xl">🎥</span>
                <span className="text-[9px] inter-bold uppercase tracking-wider">Play</span>
              </button>
            )}
          </div>
        </div>

        {/* ---------------- RIGHT: Product Info ---------------- */}
        <div className="lg:col-span-5 flex flex-col justify-start">
          
          <h1 className="text-2xl md:text-4xl inter-bold text-gray-900 leading-tight mb-2">{product.name}</h1>
          
          <div className="flex flex-wrap items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <p className="text-2xl md:text-3xl inter-bold text-red-600">৳{currentPrice}</p>
              {product.discountPrice && <p className="text-lg inter-bold text-gray-400 line-through decoration-gray-300">৳{product.regularPrice}</p>}
            </div>
            {product.sku && <div className="bg-gray-100 px-3 py-1 text-[11px] inter-bold uppercase tracking-widest text-gray-500">SKU: {product.sku}</div>}
          </div>

          <div className="w-full h-px bg-gray-200 mb-6"></div>

          {/* Colors */}
          {product.colors?.length > 0 && (
            <div className="mb-6">
              <p className="text-[11px] inter-bold uppercase tracking-widest mb-3">Select Color</p>
              <div className="flex gap-2 flex-wrap">
                {product.colors.map((color, idx) => (
                  <button key={idx} onClick={() => { setSelectedColor(color); setQty(1); }} className={`px-4 py-2 text-xs inter-bold uppercase tracking-wider border transition-all cursor-pointer ${selectedColor === color ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-800'}`}>
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div className="mb-8">
              <p className="text-[11px] inter-bold uppercase tracking-widest mb-3">Select Size</p>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((size, idx) => (
                  <button key={idx} onClick={() => { setSelectedSize(size); setQty(1); }} className={`w-12 h-12 flex items-center justify-center text-xs inter-bold uppercase border transition-all cursor-pointer ${selectedSize === size ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-800'}`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ================= DYNAMIC STOCK BADGE ================= */}
          <div className="mb-6">
            <span className={`text-[10px] inter-bold uppercase tracking-widest px-3 py-1.5 border rounded-sm ${currentVariantStock > 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              {stockMessage}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-3 mb-10">
            <div className="flex gap-3 h-14">
              <div className="flex border border-gray-300 w-32 bg-white">
                <button onClick={() => handleQtyChange('decrement')} className="w-10 h-full text-gray-500 hover:bg-gray-100 hover:text-black cursor-pointer inter-medium">-</button>
                <div className="flex-1 h-full flex items-center justify-center text-sm inter-bold border-x border-gray-200">{qty}</div>
                <button onClick={() => handleQtyChange('increment')} className="w-10 h-full text-gray-500 hover:bg-gray-100 hover:text-black cursor-pointer inter-medium">+</button>
              </div>
              
              <button 
                onClick={() => handleAction('cart')} 
                disabled={currentVariantStock === 0} 
                className={`flex-1 text-xs inter-bold uppercase tracking-widest border-2 transition-all cursor-pointer ${currentVariantStock === 0 ? 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed' : 'border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white'}`}
              >
                Add to Cart
              </button>
            </div>
            
            <button 
              onClick={() => handleAction('buy')} 
              disabled={currentVariantStock === 0} 
              className={`w-full h-14 text-xs inter-bold uppercase tracking-widest transition-all cursor-pointer ${currentVariantStock === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700 shadow-md'}`}
            >
              Order Now
            </button>
          </div>

          {/* ---------------- STATIC SECTIONS (ALWAYS OPEN) ---------------- */}
          <div className="w-full space-y-8 mt-6">
            
            {/* Description */}
            {product.description && (
              <div className="w-full">
                <h3 className="text-sm inter-bold uppercase tracking-widest text-gray-900 mb-4 pb-2 border-b border-gray-200">Description</h3>
                <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap break-words inter-regular">
                  {product.description}
                </div>
              </div>
            )}

            {/* ================= NEW: Specifications ================= */}
            {hasSpecifications && (
              <div className="w-full">
                <h3 className="text-sm inter-bold uppercase tracking-widest text-gray-900 mb-4 pb-2 border-b border-gray-200">Specifications</h3>
                <ul className="text-sm text-gray-600 space-y-2 inter-regular">
                  {product.brand && <li><span className="inter-bold text-gray-800">Brand:</span> {product.brand}</li>}
                  {product.fabric && <li><span className="inter-bold text-gray-800">Fabric/Material:</span> {product.fabric}</li>}
                  {product.gsm && <li><span className="inter-bold text-gray-800">GSM:</span> {product.gsm}</li>}
                  {product.fitType && <li><span className="inter-bold text-gray-800">Fit Type:</span> {product.fitType}</li>}
                  {product.sleeveType && <li><span className="inter-bold text-gray-800">Sleeve Type:</span> {product.sleeveType}</li>}
                  {product.pattern && <li><span className="inter-bold text-gray-800">Pattern/Design:</span> {product.pattern}</li>}
                  {product.origin && <li><span className="inter-bold text-gray-800">Origin:</span> {product.origin}</li>}
                </ul>
              </div>
            )}

            {/* Key Features */}
            {product.keyFeatures && (
              <div className="w-full">
                <h3 className="text-sm inter-bold uppercase tracking-widest text-gray-900 mb-4 pb-2 border-b border-gray-200">Key Features</h3>
                <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap break-words inter-regular">
                  {product.keyFeatures}
                </div>
              </div>
            )}

            {/* Smart Size Chart */}
            {product.sizeChart && (
              <div className="w-full">
                <h3 className="text-sm inter-bold uppercase tracking-widest text-gray-900 mb-4 pb-2 border-b border-gray-200">Size Chart</h3>
                <div className="w-full">
                  {renderSizeChart(product.sizeChart)}
                </div>
              </div>
            )}

            {/* Wash & Care */}
            {product.washingInstructions && (
              <div className="w-full">
                <h3 className="text-sm inter-bold uppercase tracking-widest text-gray-900 mb-4 pb-2 border-b border-gray-200">Wash & Care</h3>
                <div className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap break-words inter-regular">
                  {product.washingInstructions}
                </div>
              </div>
            )}

            {/* Delivery & Returns */}
            {(product.deliveryInfo || product.returnPolicy) && (
              <div className="w-full">
                <h3 className="text-sm inter-bold uppercase tracking-widest text-gray-900 mb-4 pb-2 border-b border-gray-200">Delivery & Returns</h3>
                <div className="text-sm text-gray-600 leading-relaxed space-y-4 break-words inter-regular">
                  {product.deliveryInfo && <div><p className="inter-bold text-gray-800 mb-1">Delivery Info:</p><p>{product.deliveryInfo}</p></div>}
                  {product.returnPolicy && <div><p className="inter-bold text-gray-800 mb-1">Return Policy:</p><p>{product.returnPolicy}</p></div>}
                </div>
              </div>
            )}
            
          </div>
        </div>
      </div>

      {/* ---------------- RELATED PRODUCTS SECTION ---------------- */}
      {relatedProducts.length > 0 && (
        <div className="mt-24 pt-12 border-t border-gray-200">
          <div className="flex flex-col items-center mb-10">
            <h2 className="text-2xl md:text-3xl inter-bold text-gray-900 uppercase tracking-widest">
              You May Also Like
            </h2>
            <div className="h-1 w-16 bg-red-600 mt-4 rounded-full"></div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((item) => (
              <ProductCard key={item._id} product={item} />
            ))}
          </div>
        </div>
      )}

      {/* ----------------- MODALS ----------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-white p-4 md:p-12">
          <button onClick={closeModal} className="absolute top-6 right-6 text-gray-400 hover:text-black inter-bold text-4xl z-50 cursor-pointer">&times;</button>
          {images.length > 1 && <button onClick={prevImage} className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black p-4 z-50 text-3xl cursor-pointer">&larr;</button>}
          <div className="w-full max-w-4xl h-full flex items-center justify-center overflow-hidden relative cursor-crosshair bg-white" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={closeModal}>
            <img src={images[activeImageIndex].url} alt="Zoom" className="max-w-full max-h-full object-contain transition-transform duration-200 ease-out" style={zoomStyle} onClick={(e) => e.stopPropagation()} />
          </div>
          {images.length > 1 && <button onClick={nextImage} className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black p-4 z-50 text-3xl cursor-pointer">&rarr;</button>}
        </div>
      )}

      {isVideoModalOpen && product.video?.url && (
        <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/90 p-4">
          <button onClick={() => setIsVideoModalOpen(false)} className="absolute top-6 right-6 text-white hover:text-red-500 inter-bold text-4xl z-50 cursor-pointer">&times;</button>
          <div className="w-full max-w-4xl bg-black">
            <video src={product.video.url} controls autoPlay className="w-full h-auto max-h-[80vh] object-contain"></video>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetails;