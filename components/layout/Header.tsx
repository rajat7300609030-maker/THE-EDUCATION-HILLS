import React, { useState, useEffect, useRef } from 'react';
import { useNavigation } from '../../contexts/NavigationContext';
import { PAGE_DATA } from '../../constants/pageData';
import { Page } from '../../types';
import { getSidebarLinksForRole } from './Sidebar';
import useUserProfile from '../../hooks/useUserProfile';
import ProfilePhoto from '../ui/ProfilePhoto';

interface HeaderProps {
  onMenuClick: () => void;
  onLogout: () => void;
  setIsBlurred: (isBlurred: boolean) => void;
  isScrolled: boolean;
}

const Header: React.FC<HeaderProps> = ({ onMenuClick, onLogout, setIsBlurred, isScrolled }) => {
  const { currentPage, goBack, canGoBack, navigate } = useNavigation();
  const [userProfile] = useUserProfile();
  const [isUserDropdownOpen, setUserDropdownOpen] = useState(false);
  const [isAppsDropdownOpen, setAppsDropdownOpen] = useState(false);
  
  const userDropdownRef = useRef<HTMLDivElement>(null);
  const appsDropdownRef = useRef<HTMLDivElement>(null);

  const pageInfo = PAGE_DATA[currentPage.page];

  // Get role-specific links for the dropdown
  const sidebarLinksForUser = getSidebarLinksForRole(userProfile.role);

  useEffect(() => {
    setIsBlurred(isUserDropdownOpen || isAppsDropdownOpen);
  }, [isUserDropdownOpen, isAppsDropdownOpen, setIsBlurred]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userDropdownRef.current && !userDropdownRef.current.contains(event.target as Node)) {
        setUserDropdownOpen(false);
      }
      if (appsDropdownRef.current && !appsDropdownRef.current.contains(event.target as Node)) {
        setAppsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleUserDropdown = () => {
    setUserDropdownOpen(prev => !prev);
    if(isAppsDropdownOpen) setAppsDropdownOpen(false);
  };

  const toggleAppsDropdown = () => {
    setAppsDropdownOpen(prev => !prev);
    if(isUserDropdownOpen) setUserDropdownOpen(false);
  }

  const handleNavFromDropdown = (page: Page) => {
    navigate(page);
    setAppsDropdownOpen(false);
    setUserDropdownOpen(false);
  };

  const profileIconRaw = PAGE_DATA[Page.Profile].icon;
  const profileIcon = React.cloneElement(profileIconRaw, {
    className: profileIconRaw.props.className.replace('h-6 w-6', 'h-5 w-5')
  });

  const logoutIcon = (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );

  return (
    <header className="sticky top-0 z-40 w-full p-4 flex items-center justify-between">
      <div className="header-icon-wrapper">
        {canGoBack ? (
          <button onClick={goBack} className="neo-button rounded-full p-3 text-gray-600" aria-label="Go Back">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
        ) : (
          <button onClick={onMenuClick} className="neo-button rounded-full p-3 text-gray-600" aria-label="Open Menu">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
        )}
      </div>

      <div className={`header-title-container flex flex-grow items-center justify-center text-xl font-bold text-gray-900 lg:text-2xl space-x-2 ${isScrolled ? 'header-title-hidden' : ''}`}>
        {pageInfo.icon}
        <span>{pageInfo.title}</span>
      </div>

      <div className="header-icon-wrapper">
        <div className="flex items-center space-x-2">
          { userProfile.role === 'Admin' && (
            <div className="relative" ref={appsDropdownRef}>
                <button onClick={toggleAppsDropdown} className="neo-button rounded-full p-3 text-gray-600" aria-label="Quick Navigation">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                    </svg>
                </button>
                {isAppsDropdownOpen && (
                    <div className="neo-container absolute top-14 right-0 w-56 rounded-lg p-2 space-y-2 z-50">
                      {sidebarLinksForUser.map(({ page, label }) => {
                        const icon = PAGE_DATA[page].icon;
                        const smallIcon = React.cloneElement(icon, {
                            className: icon.props.className.replace('h-6 w-6', 'h-5 w-5')
                        });

                        return (
                          <button
                            key={page}
                            onClick={() => handleNavFromDropdown(page)}
                            className="w-full text-left neo-button p-2 rounded-md text-sm text-gray-700 hover:text-blue-600 flex items-center space-x-3"
                          >
                            {smallIcon}
                            <span>{label}</span>
                          </button>
                        );
                      })}
                    </div>
                )}
            </div>
          )}

          <div className="relative" ref={userDropdownRef}>
            <button onClick={toggleUserDropdown} className="neo-button rounded-full p-1" aria-label="User Menu">
              <ProfilePhoto
                userId={userProfile.userId}
                hasPhoto={userProfile.hasPhoto}
                alt="User Profile"
                className="rounded-full w-8 h-8 object-cover"
              />
            </button>
            {isUserDropdownOpen && (
              <div className="neo-container absolute top-14 right-0 w-56 rounded-lg p-2 space-y-2 z-50">
                <div className="px-2 py-1 border-b border-gray-200">
                  <p className="text-sm font-semibold text-gray-800">{userProfile.name}</p>
                  <p className="text-xs text-gray-500">{userProfile.role}</p>
                </div>
                <button
                  onClick={() => handleNavFromDropdown(Page.Profile)}
                  className="w-full text-left neo-button p-2 rounded-md text-sm text-gray-700 hover:text-blue-600 flex items-center"
                >
                  <div className="neo-container rounded-full p-2 w-9 h-9 flex items-center justify-center mr-3">
                    {profileIcon}
                  </div>
                  <span>My Profile</span>
                </button>
                <button
                  onClick={onLogout}
                  className="w-full text-left neo-button p-2 rounded-md text-sm text-red-600 hover:text-red-800 flex items-center"
                >
                   <div className="neo-container rounded-full p-2 w-9 h-9 flex items-center justify-center mr-3">
                     {logoutIcon}
                   </div>
                  <span>Logout</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
