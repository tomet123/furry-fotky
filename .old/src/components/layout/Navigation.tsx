import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { classNames } from '@/lib/utils';

// Definice navigačních položek
const navItems = [
  { href: '/', label: 'Domů', icon: 'fas fa-home' },
  { href: '/events', label: 'Akce', icon: 'fas fa-calendar' },
  { href: '/photos', label: 'Fotky', icon: 'fas fa-images' },
  { href: '/users', label: 'Uživatelé', icon: 'fas fa-users' },
  { href: '/tags', label: 'Tagy', icon: 'fas fa-tags' },
  { href: '/about', label: 'O projektu', icon: 'fas fa-info-circle' },
];

export function Navigation() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <nav className="bg-gray-900 border-b border-gray-800 shadow-lg">
      <div className="container px-4 mx-auto">
        <div className="flex items-center justify-between h-16">
          {/* Logo a název */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <i className="mr-2 text-2xl text-amber-400 fas fa-paw"></i>
              <span className="text-xl font-bold text-white">Furry Fotky</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:block">
            <div className="flex items-center ml-10 space-x-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={classNames(
                    pathname === item.href
                      ? 'text-amber-400 border-b-2 border-amber-400'
                      : 'text-gray-300 hover:text-amber-400',
                    'flex items-center px-3 py-2 text-sm font-medium transition-colors'
                  )}
                >
                  <i className={`${item.icon} mr-1`}></i>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Uživatelské menu - bude doplněno později */}
          <div className="hidden md:block">
            <button className="px-4 py-2 text-white bg-amber-600 rounded hover:bg-amber-700">
              <i className="mr-2 fas fa-sign-in-alt"></i>
              Přihlásit se
            </button>
          </div>

          {/* Mobile menu button */}
          <div className="flex md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="inline-flex items-center justify-center p-2 text-gray-400 rounded-md hover:text-amber-400 hover:bg-gray-800 focus:outline-none"
            >
              <i className={`fas ${isMobileMenuOpen ? 'fa-times' : 'fa-bars'}`}></i>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden">
          <div className="px-2 pt-2 pb-3 space-y-1 bg-gray-800">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={classNames(
                  pathname === item.href
                    ? 'bg-gray-900 text-amber-400'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-amber-400',
                  'block px-3 py-2 rounded-md text-base font-medium'
                )}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <i className={`${item.icon} mr-2`}></i>
                {item.label}
              </Link>
            ))}
            
            {/* Tlačítko přihlášení v mobilním menu */}
            <button className="flex items-center w-full px-3 py-2 mt-2 text-white bg-amber-600 rounded hover:bg-amber-700">
              <i className="mr-2 fas fa-sign-in-alt"></i>
              Přihlásit se
            </button>
          </div>
        </div>
      )}
    </nav>
  );
} 