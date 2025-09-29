import { Home, PlusSquare, Users, UserCircle, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

interface NavigationProps {
  onSignOut: () => void;
  isAuthenticated: boolean;
}

export default function Navigation({ onSignOut, isAuthenticated }: NavigationProps) {
  const location = useLocation();

  const tabs = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/create', icon: PlusSquare, label: 'Create Post' },
    { path: '/saved', icon: Users, label: 'Saved Profiles' },
    { path: '/profile', icon: UserCircle, label: 'Profile' },
  ];

  return (
    <>
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="h-16 flex items-center justify-between">
            <div className="w-20 md:w-32"></div> {/* Spacer for alignment */}
            <h1 className="text-xl md:text-2xl font-bold text-green-600">Guidr</h1>
            {isAuthenticated ? (
              <button
                onClick={onSignOut}
                className="flex items-center text-gray-600 hover:text-gray-900 text-sm md:text-base"
              >
                <LogOut className="h-4 w-4 md:h-5 md:w-5 mr-1 md:mr-2" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            ) : (
              <div className="w-20 md:w-32"></div> /* Spacer for alignment */
            )}
          </div>
        </div>
      </header>

      {/* Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 md:top-16 md:bottom-auto z-40">
        <div className="max-w-screen-xl mx-auto px-4">
          <div className="flex justify-around items-center h-16">
            {tabs.map(({ path, icon: Icon, label }) => (
              <Link
                key={path}
                to={path}
                className={`flex flex-col items-center p-2 ${
                  location.pathname === path
                    ? 'text-green-600'
                    : 'text-gray-600 hover:text-green-600'
                }`}
              >
                <Icon className="h-5 w-5 md:h-6 md:w-6" />
                <span className="text-[10px] md:text-xs mt-1">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </nav>
    </>
  );
}