import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  DocumentArrowUpIcon, 
  MagnifyingGlassIcon, 
  ChartBarIcon, 
  UserGroupIcon,
  Cog6ToothIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { isFeatureEnabled, shouldShowUpgradePrompt } from '../config/featureFlags';

const LiteNavigation = () => {
  const location = useLocation();
  const isActive = (path) => location.pathname === path;

  const navItems = [
    {
      name: 'Claims',
      path: '/claims',
      icon: DocumentArrowUpIcon,
      description: 'Upload and process claims',
      enabled: true,
    },
    {
      name: 'Search',
      path: '/search',
      icon: MagnifyingGlassIcon,
      description: 'Find and filter claims',
      enabled: isFeatureEnabled('CORE_SEARCH'),
    },
    {
      name: 'Reports',
      path: '/reports',
      icon: ChartBarIcon,
      description: 'Basic analytics and exports',
      enabled: isFeatureEnabled('LITE_REPORTING'),
    },
    {
      name: 'Team',
      path: '/team',
      icon: UserGroupIcon,
      description: 'Manage users and roles',
      enabled: isFeatureEnabled('LITE_USER_MANAGEMENT'),
    },
    {
      name: 'Settings',
      path: '/settings',
      icon: Cog6ToothIcon,
      description: 'Account and preferences',
      enabled: true,
    },
  ];

  return (
    <nav className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            {/* Logo */}
            <div className="flex-shrink-0 flex items-center">
              <Link to="/claims" className="text-xl font-bold text-gray-900">
                ClarifyOps Lite
              </Link>
            </div>

            {/* Navigation Items */}
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              {navItems
                .filter(item => item.enabled)
                .map((item) => {
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.name}
                      to={item.path}
                      className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                        isActive(item.path)
                          ? 'border-blue-500 text-gray-900'
                          : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {item.name}
                    </Link>
                  );
                })}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Upgrade Prompt */}
            {shouldShowUpgradePrompt() && (
              <Link
                to="/upgrade"
                className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                <SparklesIcon className="w-4 h-4 mr-1" />
                Upgrade to Pro
              </Link>
            )}

            {/* User Menu */}
            <div className="flex items-center">
              <img
                className="h-8 w-8 rounded-full"
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                alt="User"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="sm:hidden">
        <div className="pt-2 pb-3 space-y-1">
          {navItems
            .filter(item => item.enabled)
            .map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.path}
                  className={`block pl-3 pr-4 py-2 border-l-4 text-base font-medium ${
                    isActive(item.path)
                      ? 'bg-blue-50 border-blue-500 text-blue-700'
                      : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300 hover:text-gray-800'
                  }`}
                >
                  <div className="flex items-center">
                    <Icon className="w-5 h-5 mr-3" />
                    {item.name}
                  </div>
                </Link>
              );
            })}
        </div>
      </div>
    </nav>
  );
};

export default LiteNavigation; 