import { useState } from 'react';
import { Link, useNavigate } from 'react-router'; 
import { useAuth } from '../../context/AuthContext';
import api from '../../api/axios';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    try {
      const { data } = await api.post('/api/auth/register', { name, email, password });
      login(data); // Account toiri korar por sathe sathe auto-login
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed! Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-gray-50 font-sans">
      
      {/* Background Decorative Blobs (Red Theme) */}
      <div className="absolute top-[10%] left-[-5%] w-100 h-100 bg-red-100 rounded-full mix-blend-multiply filter blur-3xl opacity-60 animate-blob"></div>
      <div className="absolute bottom-[-5%] right-[-5%] w-87.5 h-87.5 bg-red-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40 animate-blob animation-delay-2000"></div>

      {/* Main Card */}
      <div className="bg-white p-10 md:p-14 rounded-[30px] shadow-2xl w-full max-w-105 relative z-10 border border-red-50">
        
        {/* Centered Image Logo */}
<div className="flex justify-center mb-8">
  <img 
    src="https://res.cloudinary.com/dsrs8hryx/image/upload/v1789818500/DressTown_Logo_Png_oilfhm.png" 
    alt="DressTown Logo" 
    className="h-20 w-auto object-contain" 
  />
</div>

        {/* Headings */}
        <h2 className="text-3xl font-bold text-gray-800 tracking-tight">Create Account</h2>
        <p className="text-sm text-red-500 mt-1 mb-8 font-medium tracking-wide">Join DressTown</p>

        {error && <div className="text-red-500 text-sm mb-4 text-center bg-red-50 py-2 rounded-md">{error}</div>}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Name Input */}
          <div className="relative">
            <input 
              type="text" 
              placeholder="Full Name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-transparent border-0 border-b-2 border-gray-200 py-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors text-[15px]"
            />
          </div>

          {/* Email Input */}
          <div className="relative">
            <input 
              type="email" 
              placeholder="Email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-0 border-b-2 border-gray-200 py-2 px-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors text-[15px]"
            />
          </div>

          {/* Password Input */}
          <div className="relative mb-2">
            <input 
              type="password" 
              placeholder="Password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-0 border-b-2 border-gray-200 py-2 px-2 text-gray-800 placeholder-gray-400 focus:outline-none focus:border-red-500 transition-colors text-[15px]"
            />
          </div>

          {/* Centered Pill Button */}
          <div className="flex justify-center mt-4">
            <button 
              type="submit" 
              disabled={loading}
              className="bg-red-500 hover:bg-red-600 text-white font-bold py-2.5 px-10 rounded-full shadow-lg shadow-red-500/30 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Register'}
            </button>
          </div>
        </form>

        {/* Footer Links */}
        <div className="flex justify-center items-center mt-10 text-[13px] font-semibold text-gray-400">
          <span>Already have an account? </span>
          <Link to="/login" className="text-red-500 hover:text-red-600 transition-colors ml-1">
            Login
          </Link>
        </div>

      </div>
    </div>
  );
};

export default Register;