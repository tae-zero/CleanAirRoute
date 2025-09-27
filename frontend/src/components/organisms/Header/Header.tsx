'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Icon } from '@/components/atoms';
import { useUserStore } from '@/store/useUserStore';
import { useAppStore } from '@/store/useAppStore';

interface HeaderProps {
  className?: string;
}

export default function Header({ className }: HeaderProps) {
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const { 
    preferences, 
    isAuthenticated, 
    userName, 
    toggleTheme, 
    toggleNotifications 
  } = useUserStore();
  
  const { 
    notifications, 
    unreadNotificationCount,
    removeNotification 
  } = useAppStore();

  const handleLogoClick = () => {
    router.push('/');
  };

  const handleMobileMenuToggle = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const handleNotificationClick = () => {
    console.log('알림 패널 토글');
  };

  const handleSettingsClick = () => {
    router.push('/settings');
  };

  const handleProfileClick = () => {
    if (isAuthenticated) {
      router.push('/profile');
    } else {
      router.push('/login');
    }
  };

  return (
    <header className={`bg-white shadow-sm border-b border-gray-200 ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* 로고 및 브랜드 */}
          <div className="flex items-center">
            <button
              onClick={handleLogoClick}
              className="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
            >
              <Icon name="map" size="xl" />
              <span className="text-xl font-bold text-gradient">
                CleanAir Route
              </span>
            </button>
          </div>

          {/* 데스크톱 네비게이션 */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              홈
            </Link>
            <Link
              href="/routes"
              className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              경로 검색
            </Link>
            <Link
              href="/air-quality"
              className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              대기질 정보
            </Link>
            <Link
              href="/about"
              className="text-gray-700 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              서비스 소개
            </Link>
          </nav>

          {/* 액션 버튼들 */}
          <div className="flex items-center space-x-4">
            {/* 테마 토글 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              title={preferences.theme === 'light' ? '다크 모드로 전환' : '라이트 모드로 전환'}
            >
              <Icon 
                name={preferences.theme === 'light' ? 'moon' : 'sun'} 
                size="sm" 
              />
            </Button>

            {/* 알림 */}
            <div className="relative">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleNotificationClick}
                title="알림"
                className="relative"
              >
                <Icon name="bell" size="sm" />
                {unreadNotificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                    {unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}
                  </span>
                )}
              </Button>
            </div>

            {/* 설정 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSettingsClick}
              title="설정"
            >
              <Icon name="settings" size="sm" />
            </Button>

            {/* 사용자 프로필 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleProfileClick}
              title={isAuthenticated ? '프로필' : '로그인'}
              className="flex items-center space-x-2"
            >
              <Icon name="user" size="sm" />
              {isAuthenticated && userName && (
                <span className="hidden sm:block text-sm font-medium">
                  {userName}
                </span>
              )}
            </Button>

            {/* 모바일 메뉴 토글 */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMobileMenuToggle}
              className="md:hidden"
            >
              <Icon 
                name={isMobileMenuOpen ? 'close' : 'menu'} 
                size="md" 
              />
            </Button>
          </div>
        </div>

        {/* 모바일 메뉴 */}
        {isMobileMenuOpen && (
          <div className="md:hidden">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 border-t border-gray-200">
              <Link
                href="/"
                className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md text-base font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                홈
              </Link>
              <Link
                href="/routes"
                className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md text-base font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                경로 검색
              </Link>
              <Link
                href="/air-quality"
                className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md text-base font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                대기질 정보
              </Link>
              <Link
                href="/about"
                className="block px-3 py-2 text-gray-700 hover:text-primary-600 hover:bg-gray-50 rounded-md text-base font-medium transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                서비스 소개
              </Link>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
