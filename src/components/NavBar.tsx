
import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  Menu, 
  X, 
  Home, 
  Briefcase, 
  UserCircle, 
  LogOut, 
  Calculator 
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const NavBar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const location = useLocation();
  const { user, signOut } = useAuth();

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleMenu = () => {
    setIsOpen(!isOpen);
  };

  const closeMenu = () => {
    setIsOpen(false);
  };

  return (
    <nav className="bg-noir-light border-b border-noir-accent">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/dashboard" className="flex-shrink-0 flex items-center">
              <span className="text-xl font-detective text-neon-cyan">Math<span className="text-neon-purple">Detective</span></span>
            </Link>
          </div>
          
          {/* Mobile menu button */}
          <div className="flex items-center sm:hidden">
            <button
              onClick={toggleMenu}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-noir-accent"
            >
              {isOpen ? (
                <X className="block h-6 w-6" />
              ) : (
                <Menu className="block h-6 w-6" />
              )}
            </button>
          </div>
          
          {/* Desktop menu */}
          <div className="hidden sm:flex sm:items-center sm:ml-6">
            <div className="flex space-x-4">
              <Link
                to="/dashboard"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive("/dashboard") 
                    ? "text-neon-cyan bg-noir-accent" 
                    : "text-gray-300 hover:text-neon-cyan hover:bg-noir-accent"
                }`}
              >
                <div className="flex items-center">
                  <Home className="mr-1 h-4 w-4" />
                  Dashboard
                </div>
              </Link>
              
              <Link
                to="/cases"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive("/cases") 
                    ? "text-neon-cyan bg-noir-accent" 
                    : "text-gray-300 hover:text-neon-cyan hover:bg-noir-accent"
                }`}
              >
                <div className="flex items-center">
                  <Briefcase className="mr-1 h-4 w-4" />
                  Cases
                </div>
              </Link>
              
              <Link
                to="/calculator"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive("/calculator") 
                    ? "text-neon-cyan bg-noir-accent" 
                    : "text-gray-300 hover:text-neon-cyan hover:bg-noir-accent"
                }`}
              >
                <div className="flex items-center">
                  <Calculator className="mr-1 h-4 w-4" />
                  Math Tools
                </div>
              </Link>
              
              <Link
                to="/profile"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  isActive("/profile") 
                    ? "text-neon-cyan bg-noir-accent" 
                    : "text-gray-300 hover:text-neon-cyan hover:bg-noir-accent"
                }`}
              >
                <div className="flex items-center">
                  <UserCircle className="mr-1 h-4 w-4" />
                  Profile
                </div>
              </Link>
              
              <button
                onClick={signOut}
                className="px-3 py-2 rounded-md text-sm font-medium text-gray-300 hover:text-neon-pink hover:bg-noir-accent"
              >
                <div className="flex items-center">
                  <LogOut className="mr-1 h-4 w-4" />
                  Sign Out
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {isOpen && (
        <div className="sm:hidden bg-noir-accent border-t border-noir-light animate-fade-in">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/dashboard"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/dashboard") 
                  ? "text-neon-cyan bg-noir" 
                  : "text-gray-300 hover:text-neon-cyan hover:bg-noir"
              }`}
              onClick={closeMenu}
            >
              <div className="flex items-center">
                <Home className="mr-2 h-5 w-5" />
                Dashboard
              </div>
            </Link>
            
            <Link
              to="/cases"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/cases") 
                  ? "text-neon-cyan bg-noir" 
                  : "text-gray-300 hover:text-neon-cyan hover:bg-noir"
              }`}
              onClick={closeMenu}
            >
              <div className="flex items-center">
                <Briefcase className="mr-2 h-5 w-5" />
                Cases
              </div>
            </Link>
            
            <Link
              to="/calculator"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/calculator") 
                  ? "text-neon-cyan bg-noir" 
                  : "text-gray-300 hover:text-neon-cyan hover:bg-noir"
              }`}
              onClick={closeMenu}
            >
              <div className="flex items-center">
                <Calculator className="mr-2 h-5 w-5" />
                Math Tools
              </div>
            </Link>
            
            <Link
              to="/profile"
              className={`block px-3 py-2 rounded-md text-base font-medium ${
                isActive("/profile") 
                  ? "text-neon-cyan bg-noir" 
                  : "text-gray-300 hover:text-neon-cyan hover:bg-noir"
              }`}
              onClick={closeMenu}
            >
              <div className="flex items-center">
                <UserCircle className="mr-2 h-5 w-5" />
                Profile
              </div>
            </Link>
            
            <button
              onClick={() => {
                signOut();
                closeMenu();
              }}
              className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-300 hover:text-neon-pink hover:bg-noir"
            >
              <div className="flex items-center">
                <LogOut className="mr-2 h-5 w-5" />
                Sign Out
              </div>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default NavBar;
