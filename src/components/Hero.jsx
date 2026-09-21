const Hero = () => {
  return (
    // mt-24 soriye deya hoyeche ebong h-screen deya hoyeche jate ekdom top theke shuru hoy
    <div className="relative w-full h-screen bg-gray-100">
      
      {/* Background Image */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ 
          backgroundImage: "url('https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop')"
        }}
      >
      </div>
      
    </div>
  );
};

export default Hero;