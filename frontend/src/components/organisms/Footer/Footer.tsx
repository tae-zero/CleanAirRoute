'use client';

import React from 'react';
import Link from 'next/link';
import { Icon } from '@/components/atoms';

interface FooterProps {
  className?: string;
}

export default function Footer({ className }: FooterProps) {
  const currentYear = new Date().getFullYear();

  return (
    <footer className={`bg-gray-900 text-white ${className}`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* 브랜드 정보 */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Icon name="map" size="xl" className="text-primary-400" />
              <span className="text-xl font-bold">CleanAir Route</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">
              대기질을 고려한 최적의 이동 경로를 추천하여 
              건강한 일상을 지원하는 서비스입니다.
            </p>
            <div className="flex items-center space-x-2 text-sm text-gray-400">
              <Icon name="heart" size="sm" className="text-red-400" />
              <span>건강한 환경을 위한 작은 실천</span>
            </div>
          </div>

          {/* 서비스 링크 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">서비스</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/routes"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  경로 검색
                </Link>
              </li>
              <li>
                <Link
                  href="/air-quality"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  대기질 정보
                </Link>
              </li>
              <li>
                <Link
                  href="/forecast"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  대기질 예보
                </Link>
              </li>
              <li>
                <Link
                  href="/health-tips"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  건강 가이드
                </Link>
              </li>
            </ul>
          </div>

          {/* 회사 정보 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">회사</h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/about"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  서비스 소개
                </Link>
              </li>
              <li>
                <Link
                  href="/team"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  팀 소개
                </Link>
              </li>
              <li>
                <Link
                  href="/careers"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  채용 정보
                </Link>
              </li>
              <li>
                <Link
                  href="/press"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  보도자료
                </Link>
              </li>
            </ul>
          </div>

          {/* 연락처 정보 */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">연락처</h3>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <Icon name="info" size="sm" className="text-gray-400" />
                <a
                  href="mailto:contact@cleanairroute.com"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  contact@cleanairroute.com
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Icon name="info" size="sm" className="text-gray-400" />
                <a
                  href="tel:+82-2-1234-5678"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  02-1234-5678
                </a>
              </div>
              <div className="flex items-center space-x-3">
                <Icon name="info" size="sm" className="text-gray-400" />
                <a
                  href="https://cleanairroute.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-white transition-colors text-sm"
                >
                  cleanairroute.com
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* 하단 구분선 */}
        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            {/* 저작권 정보 */}
            <div className="text-sm text-gray-400">
              © {currentYear} CleanAir Route. All rights reserved.
            </div>

            {/* 법적 링크 */}
            <div className="flex items-center space-x-6">
              <Link
                href="/privacy"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                개인정보처리방침
              </Link>
              <Link
                href="/terms"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                이용약관
              </Link>
              <Link
                href="/cookies"
                className="text-sm text-gray-400 hover:text-white transition-colors"
              >
                쿠키 정책
              </Link>
            </div>
          </div>
        </div>

        {/* 추가 정보 */}
        <div className="mt-6 pt-6 border-t border-gray-800">
          <div className="text-center text-sm text-gray-500">
            <p>
              본 서비스는 환경부 대기질 정보와 기상청 데이터를 기반으로 제공됩니다.
            </p>
            <p className="mt-1">
              정확한 대기질 정보는 공식 기관의 데이터를 참고하시기 바랍니다.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
