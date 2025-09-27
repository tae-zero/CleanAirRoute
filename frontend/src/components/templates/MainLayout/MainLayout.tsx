'use client';

import React from 'react';
import { Header, Footer } from '@/components/organisms';

interface MainLayoutProps {
  children: React.ReactNode;
  className?: string;
}

export default function MainLayout({ children, className }: MainLayoutProps) {
  return (
    <div className={`min-h-screen bg-gray-50 flex flex-col ${className}`}>
      {/* 헤더 */}
      <Header />

      {/* 메인 컨텐츠 */}
      <main className="flex-1">
        {children}
      </main>

      {/* 푸터 */}
      <Footer />
    </div>
  );
}
