import React, { useState, useEffect, useRef } from 'react';
import { Save, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const Header: React.FC = () => {
  const { user, signOut } = useAuth();
  const [isFileMenuOpen, setIsFileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const fileMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // SVG Data URI for the stacked COMPLEX logo (White text on black background)
  const logoSrc = "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIj4KICAgICAgPHJlY3Qgd2lkdGg9IjEwMCIgaGVpZ2h0PSIxMDAiIGZpbGw9ImJsYWNrIi8+CiAgICAgIDx0ZXh0IHg9IjUwIiB5PSI0NyIgZm9udC1mYW1pbHk9IkltcGFjdCwgQXJpYWwgQmxhY2ssIHNhbnMtc2VyaWYiIGZvbnQtc2l6ZT0iNDIiIGZpbGw9IndoaXRlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBsZXR0ZXItc3BhY2luZz0iLTEiPkNPTTwvdGV4dD4KICAgICAgPHRleHQgeD0iNTAiIHk9Ijg1IiBmb250LWZhbWlseT0iSW1wYWN0LCBBcmlhbCBCbGFjaywgc2Fucy1zZXJpZiIgZm9udC1zaXplPSI0MiIgZmlsbD0id2hpdGUiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGxldHRlci1zcGFjaW5nPSItMSI+UExFWDwvdGV4dD4KICAgIDwvc3ZnPg==";

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (fileMenuRef.current && !fileMenuRef.current.contains(event.target as Node)) {
        setIsFileMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSave = () => {
    // Placeholder for save functionality
    alert("Project saved successfully!");
    setIsFileMenuOpen(false);
  };

  const handleSignOut = async () => {
    setIsUserMenuOpen(false);
    await signOut();
  };

  return (
    <header className="flex items-center justify-between whitespace-nowrap border-b border-border-ui px-4 h-12 bg-panel-bg shrink-0 z-20">
      <div className="flex items-center gap-3">
        {/* Brand Logo */}
        <img
          src={logoSrc}
          alt="Complex"
          className="size-8 rounded-sm object-cover"
        />

        <nav className="flex items-center ml-2 space-x-1">
          <button
            className="px-3 py-1 text-xs font-medium rounded-sm transition-colors text-white bg-active-item border border-border-ui/50"
          >
            Editor
          </button>

          <div className="relative" ref={fileMenuRef}>
            <button
              onClick={() => setIsFileMenuOpen(!isFileMenuOpen)}
              className={`px-3 py-1 text-xs font-medium rounded-sm transition-colors ${isFileMenuOpen ? 'bg-white/10 text-white' : 'text-text-muted hover:bg-white/5 hover:text-white'}`}
            >
              File
            </button>

            {isFileMenuOpen && (
              <div className="absolute top-full left-0 mt-1 w-32 bg-panel-header border border-border-ui shadow-xl rounded-sm py-1 z-50 flex flex-col">
                <button
                  onClick={handleSave}
                  className="w-full text-left px-3 py-2 text-xs text-text-main hover:bg-active-item flex items-center gap-2 transition-colors"
                >
                  <Save size={14} />
                  <span>Save</span>
                </button>
              </div>
            )}
          </div>
        </nav>
      </div>

      <div className="flex items-center gap-3">
        {/* User Profile Dropdown */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
            className="flex items-center gap-2 hover:bg-white/5 rounded-lg px-2 py-1 transition-colors"
          >
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-7 border border-border-ui"
              style={{ backgroundImage: user?.photoURL ? `url("${user.photoURL}")` : 'none', backgroundColor: !user?.photoURL ? '#6366f1' : 'transparent' }}
              title={user?.displayName || 'User Profile'}
            >
              {!user?.photoURL && (
                <span className="flex items-center justify-center h-full text-white text-xs font-medium">
                  {user?.displayName?.charAt(0) || user?.email?.charAt(0) || '?'}
                </span>
              )}
            </div>
            <span className="text-xs text-text-secondary hidden sm:block max-w-[120px] truncate">
              {user?.displayName || user?.email?.split('@')[0]}
            </span>
            <ChevronDown size={14} className="text-text-muted" />
          </button>

          {isUserMenuOpen && (
            <div className="absolute top-full right-0 mt-1 w-48 bg-panel-header border border-border-ui shadow-xl rounded-sm py-1 z-50">
              <div className="px-3 py-2 border-b border-border-ui">
                <p className="text-xs font-medium text-white truncate">{user?.displayName}</p>
                <p className="text-xs text-text-muted truncate">{user?.email}</p>
              </div>
              <button
                onClick={handleSignOut}
                className="w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 flex items-center gap-2 transition-colors"
              >
                <LogOut size={14} />
                <span>Sign Out</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
