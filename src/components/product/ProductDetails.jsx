import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router"; 
import api from "../../api/axios"; 
import toast from "react-hot-toast";

const ProductDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
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

  // Accordion State
  const [activeTab, setActiveTab] = useState("description");

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data } = await api.get(`/api/products/${id}`);
        setProduct(data);
        
        if (data.sizes?.length > 0) setSelectedSize(data.sizes[0]);
        if (data.colors?.length > 0) setSelectedColor(data.colors[0]);
      } catch (error) {
        toast.error("Failed to load product details!");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
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

  const handleAction = (type) => {
    if (product.stock === 0) return toast.error("Sorry, this item is out of stock!");
    if (product.sizes?.length > 0 && !selectedSize) return toast.error("Please select a size");
    if (product.colors?.length > 0 && !selectedColor) return toast.error("Please select a color");

    const cartItem = {
      product: product._id,
      name: product.name,
      image: product.images[0]?.url,
      price: product.discountPrice || product.regularPrice,
      qty,
      size: selectedSize,
      color: selectedColor
    };

    if (type === 'cart') {
      toast.success(`${product.name} added to cart! 🛒`);
    } else {
      toast.success(`Order initiated...`);
      // navigate('/checkout');
    }
  };

  if (loading) return <div className="p-8 text-center font-bold text-gray-500 uppercase tracking-widest mt-20">Loading...</div>;
  if (!product) return <div className="p-8 text-center font-bold text-red-500 uppercase tracking-widest mt-20">Product Not Found!</div>;

  const images = product.images?.length > 0 ? product.images : [{ url: "https://via.placeholder.com/600" }];
  const currentPrice = product.discountPrice || product.regularPrice;

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-8 mt-4 md:mt-30 mb-20 font-sans text-gray-800">
      
      {/* ---------------- BREADCRUMB ---------------- */}
      <div className="mb-6 flex flex-wrap items-center text-[10px] font-bold text-gray-400 uppercase tracking-widest gap-2">
        <Link to="/" className="hover:text-gray-800 transition-colors">Home</Link> 
        <span>/</span>
        
        {/* Gender এবং Category এক হলে যেন ডাবল না দেখায় তার লজিক */}
        {product.gender && product.gender.toLowerCase() !== product.category?.name?.toLowerCase() && (
          <>
            <span>{product.gender}</span>
            <span>/</span>
          </>
        )}
        
        {product.category?.name && (
          <>
            <span className="text-gray-600">{product.category.name}</span>
            <span>/</span>
          </>
        )}
        
        {product.subCategory && (
          <>
            <span className="text-gray-600">{product.subCategory}</span>
            <span>/</span>
          </>
        )}
        
        <span className="text-gray-900">{product.name}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">
        
        {/* ---------------- LEFT: Image Gallery ---------------- */}
        <div className="lg:col-span-7 flex flex-col gap-4 sticky top-4 self-start">
          <div 
            className="w-full aspect-4/5 border border-gray-200 bg-gray-50 cursor-zoom-in overflow-hidden relative group"
            onClick={() => openModal(activeImageIndex)}
          >
            <img src={images[activeImageIndex].url} alt={product.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 flex items-center justify-center">
              <span className="opacity-0 group-hover:opacity-100 bg-white text-black text-[10px] font-bold uppercase tracking-widest px-4 py-2 shadow-sm transition-opacity">Click to Zoom</span>
            </div>
          </div>

          <div className="grid grid-cols-5 md:grid-cols-6 gap-3">
            {/* Thumbnails */}
            {images.map((img, idx) => (
              <button key={idx} onClick={() => setActiveImageIndex(idx)} className={`aspect-square border transition-all ${activeImageIndex === idx ? 'border-gray-800 shadow-sm' : 'border-gray-200 opacity-60 hover:opacity-100'}`}>
                <img src={img.url} alt={`Thumb ${idx}`} className="w-full h-full object-cover" />
              </button>
            ))}
            {/* Video Thumbnail Button (If video exists) */}
            {product.video?.url && (
              <button onClick={() => setIsVideoModalOpen(true)} className="aspect-square border border-gray-200 opacity-80 hover:opacity-100 bg-gray-100 flex flex-col items-center justify-center gap-1 transition-all">
                <span className="text-xl">🎥</span>
                <span className="text-[9px] font-bold uppercase tracking-wider">Play</span>
              </button>
            )}
          </div>
        </div>

        {/* ---------------- RIGHT: Product Info ---------------- */}
        <div className="lg:col-span-5 flex flex-col justify-start">
          
          <h1 className="text-2xl md:text-4xl font-extrabold text-gray-900 leading-tight mb-2">
            {product.name}
          </h1>
          
          <div className="flex flex-wrap items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <p className="text-2xl md:text-3xl font-extrabold text-red-600">৳ {currentPrice}</p>
              {product.discountPrice && <p className="text-lg font-bold text-gray-400 line-through">৳ {product.regularPrice}</p>}
            </div>
            {product.sku && <div className="bg-gray-100 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-gray-500">SKU: {product.sku}</div>}
          </div>

          <div className="w-full h-px bg-gray-200 mb-6"></div>

          {/* Quick Specs Grid (Dynamic from your form) */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-y-4 gap-x-2 mb-6">
            {product.brand && <div><p className="text-[10px] text-gray-400 uppercase tracking-widest">Brand</p><p className="text-xs font-bold">{product.brand}</p></div>}
            {product.fabric && <div><p className="text-[10px] text-gray-400 uppercase tracking-widest">Fabric</p><p className="text-xs font-bold">{product.fabric}</p></div>}
            {product.gsm && <div><p className="text-[10px] text-gray-400 uppercase tracking-widest">GSM</p><p className="text-xs font-bold">{product.gsm}</p></div>}
            {product.fitType && <div><p className="text-[10px] text-gray-400 uppercase tracking-widest">Fit Type</p><p className="text-xs font-bold">{product.fitType}</p></div>}
            {product.sleeveType && <div><p className="text-[10px] text-gray-400 uppercase tracking-widest">Sleeve</p><p className="text-xs font-bold">{product.sleeveType}</p></div>}
            {product.pattern && <div><p className="text-[10px] text-gray-400 uppercase tracking-widest">Pattern</p><p className="text-xs font-bold">{product.pattern}</p></div>}
          </div>

          {/* Colors */}
          {product.colors?.length > 0 && (
            <div className="mb-6">
              <p className="text-[11px] font-bold uppercase tracking-widest mb-3">Select Color</p>
              <div className="flex gap-2 flex-wrap">
                {product.colors.map((color, idx) => (
                  <button key={idx} onClick={() => setSelectedColor(color)} className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border transition-all ${selectedColor === color ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-800'}`}>
                    {color}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Sizes */}
          {product.sizes?.length > 0 && (
            <div className="mb-8">
              <p className="text-[11px] font-bold uppercase tracking-widest mb-3">Select Size</p>
              <div className="flex gap-2 flex-wrap">
                {product.sizes.map((size, idx) => (
                  <button key={idx} onClick={() => setSelectedSize(size)} className={`w-12 h-12 flex items-center justify-center text-xs font-bold uppercase border transition-all ${selectedSize === size ? 'bg-gray-900 text-white border-gray-900 shadow-md' : 'bg-white text-gray-600 border-gray-300 hover:border-gray-800'}`}>
                    {size}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock */}
          <div className="mb-6">
            <span className={`text-[10px] font-bold uppercase tracking-widest px-3 py-1 border ${product.stock > 0 ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
              {product.stock > 0 ? `${product.stock} In Stock` : 'Out of Stock'}
            </span>
          </div>

          {/* Buttons */}
          <div className="flex flex-col gap-3 mb-10">
            <div className="flex gap-3 h-14">
              <div className="flex border border-gray-300 w-32 bg-white">
                <button onClick={() => setQty(prev => prev > 1 ? prev - 1 : 1)} className="w-10 h-full text-gray-500 hover:bg-gray-100">-</button>
                <div className="flex-1 h-full flex items-center justify-center text-sm font-bold border-x border-gray-200">{qty}</div>
                <button onClick={() => setQty(prev => prev < product.stock ? prev + 1 : prev)} className="w-10 h-full text-gray-500 hover:bg-gray-100">+</button>
              </div>
              <button onClick={() => handleAction('cart')} disabled={product.stock === 0} className={`flex-1 text-xs font-bold uppercase tracking-widest border-2 transition-all ${product.stock === 0 ? 'border-gray-200 text-gray-400 cursor-not-allowed' : 'border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white'}`}>
                Add to Cart
              </button>
            </div>
            <button onClick={() => handleAction('buy')} disabled={product.stock === 0} className={`w-full h-14 text-xs font-bold uppercase tracking-widest transition-all ${product.stock === 0 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-red-600 text-white hover:bg-red-700 shadow-md'}`}>
              Order Now
            </button>
          </div>

          {/* ---------------- DYNAMIC ACCORDION ---------------- */}
          <div className="border-t border-gray-200 w-full overflow-hidden">
            
            {/* Description */}
            {product.description && (
              <div className="border-b border-gray-200 w-full">
                <button onClick={() => setActiveTab(activeTab === 'description' ? '' : 'description')} className="w-full py-4 flex justify-between items-center text-left outline-none">
                  <span className="text-xs font-bold uppercase tracking-widest">Description</span>
                  <span className="text-gray-400">{activeTab === 'description' ? '−' : '+'}</span>
                </button>
                {activeTab === 'description' && (
                  <div className="pb-6 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap wrap-break-word">{product.description}</div>
                )}
              </div>
            )}

            {/* Key Features */}
            {product.keyFeatures && (
              <div className="border-b border-gray-200 w-full">
                <button onClick={() => setActiveTab(activeTab === 'features' ? '' : 'features')} className="w-full py-4 flex justify-between items-center text-left outline-none">
                  <span className="text-xs font-bold uppercase tracking-widest">Key Features</span>
                  <span className="text-gray-400">{activeTab === 'features' ? '−' : '+'}</span>
                </button>
                {activeTab === 'features' && (
                  <div className="pb-6 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap wrap-break-word">{product.keyFeatures}</div>
                )}
              </div>
            )}

            {/* Size Chart Info */}
            {product.sizeChart && (
              <div className="border-b border-gray-200 w-full">
                <button onClick={() => setActiveTab(activeTab === 'size' ? '' : 'size')} className="w-full py-4 flex justify-between items-center text-left outline-none">
                  <span className="text-xs font-bold uppercase tracking-widest">Size Chart</span>
                  <span className="text-gray-400">{activeTab === 'size' ? '−' : '+'}</span>
                </button>
                {activeTab === 'size' && (
                  <div className="pb-6 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap wrap-break-word">{product.sizeChart}</div>
                )}
              </div>
            )}

            {/* Wash Care */}
            {product.washingInstructions && (
              <div className="border-b border-gray-200 w-full">
                <button onClick={() => setActiveTab(activeTab === 'wash' ? '' : 'wash')} className="w-full py-4 flex justify-between items-center text-left outline-none">
                  <span className="text-xs font-bold uppercase tracking-widest">Wash & Care</span>
                  <span className="text-gray-400">{activeTab === 'wash' ? '−' : '+'}</span>
                </button>
                {activeTab === 'wash' && (
                  <div className="pb-6 text-sm text-gray-600 leading-relaxed whitespace-pre-wrap break-words">{product.washingInstructions}</div>
                )}
              </div>
            )}

            {/* Delivery & Return Policy */}
            {(product.deliveryInfo || product.returnPolicy) && (
              <div className="border-b border-gray-200 w-full">
                <button onClick={() => setActiveTab(activeTab === 'delivery' ? '' : 'delivery')} className="w-full py-4 flex justify-between items-center text-left outline-none">
                  <span className="text-xs font-bold uppercase tracking-widest">Delivery & Returns</span>
                  <span className="text-gray-400">{activeTab === 'delivery' ? '−' : '+'}</span>
                </button>
                {activeTab === 'delivery' && (
                  <div className="pb-6 text-sm text-gray-600 leading-relaxed space-y-4 break-words">
                    {product.deliveryInfo && <div><p className="font-bold text-gray-800 mb-1">Delivery Info:</p><p>{product.deliveryInfo}</p></div>}
                    {product.returnPolicy && <div><p className="font-bold text-gray-800 mb-1">Return Policy:</p><p>{product.returnPolicy}</p></div>}
                  </div>
                )}
              </div>
            )}
            
          </div>
        </div>
      </div>

      {/* ----------------- IMAGE MODAL ----------------- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white p-4 md:p-12">
          <button onClick={closeModal} className="absolute top-6 right-6 text-gray-400 hover:text-black font-bold text-4xl z-50">&times;</button>
          {images.length > 1 && <button onClick={prevImage} className="absolute left-2 md:left-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black p-4 z-50 text-3xl">&larr;</button>}
          
          <div className="w-full max-w-4xl h-full flex items-center justify-center overflow-hidden relative cursor-crosshair bg-white" onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave} onClick={closeModal}>
            <img src={images[activeImageIndex].url} alt="Zoom" className="max-w-full max-h-full object-contain transition-transform duration-200 ease-out" style={zoomStyle} onClick={(e) => e.stopPropagation()} />
          </div>

          {images.length > 1 && <button onClick={nextImage} className="absolute right-2 md:right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-black p-4 z-50 text-3xl">&rarr;</button>}
        </div>
      )}

      {/* ----------------- VIDEO MODAL ----------------- */}
      {isVideoModalOpen && product.video?.url && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-4">
          <button onClick={() => setIsVideoModalOpen(false)} className="absolute top-6 right-6 text-white hover:text-red-500 font-bold text-4xl z-50">&times;</button>
          <div className="w-full max-w-4xl bg-black">
            <video src={product.video.url} controls autoPlay className="w-full h-auto max-h-[80vh] object-contain"></video>
          </div>
        </div>
      )}

    </div>
  );
};

export default ProductDetails;