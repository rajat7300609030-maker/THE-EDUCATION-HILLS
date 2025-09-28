import React, { useState, ReactNode, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';

interface MainLayoutProps {
  children: ReactNode;
  onLogout: () => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, onLogout }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [isHeaderDropdownOpen, setIsHeaderDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  
  const isOverlayVisible = isSidebarOpen || isHeaderDropdownOpen;

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Fix: Add an effect to disable body scrolling when the sidebar or any overlay is visible.
  useEffect(() => {
    if (isOverlayVisible) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }
    // Cleanup function to ensure the class is removed when the component unmounts.
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [isOverlayVisible]);


  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setSidebarOpen(false);
  };
  
  return (
    <div className="h-full min-h-screen w-full flex flex-col">
      <div 
        className={`overlay ${isOverlayVisible ? 'visible' : ''}`}
        onClick={closeSidebar}
      />
      <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />
      <Header 
        onMenuClick={toggleSidebar} 
        onLogout={onLogout} 
        setIsBlurred={setIsHeaderDropdownOpen}
        isScrolled={isScrolled} 
      />
      <main className="flex-grow p-4 md:p-8 transition-all duration-300">
        {children}
      </main>
    </div>
  );
};

export default MainLayout;