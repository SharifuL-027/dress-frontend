import { Link } from "react-router";

const Hero = () => {
  return (
    // h-[calc(100vh-6rem)] screen er full height nibe navbar er height baad diye
    <div className="relative w-full h-[calc(100vh-6rem)] mt-24 bg-gray-100">
      
      {/* Shudhumatro Background Image */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-no-repeat"
        style={{ 
          // Apnar original e-commerce banner chobir URL ekhane boshaben
          backgroundImage: "url('https://images.unsplash.com/photo-1483985988355-763728e1935b?q=80&w=2070&auto=format&fit=crop')"
        }}
      >
      </div>
      
    </div>
  );
};

export default Hero;