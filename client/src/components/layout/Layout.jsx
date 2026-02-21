import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from '../common/Navbar';
import Footer from '../common/Footer';
import StarsBackground from '../common/StarsBackground';
import { useTheme } from '../../context/ThemeContext';

const Layout = () => {
  const { theme } = useTheme();

  return (
    <div className={`min-h-screen bg-cosmic-dark text-white ${theme}`}>
      <StarsBackground />
      <Navbar />
      <main className="container mx-auto px-4 py-8 relative z-10">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
};

export default Layout;
