import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import Script from 'next/script';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'CleanAir Route - 건강한 경로 찾기',
  description: '대기질을 고려한 최적의 이동 경로를 추천하는 서비스',
  keywords: ['대기질', '경로', '내비게이션', '건강', '환경'],
  authors: [{ name: 'CleanAir Route Team' }],
  viewport: 'width=device-width, initial-scale=1',
  themeColor: '#3b82f6',
  openGraph: {
    title: 'CleanAir Route - 건강한 경로 찾기',
    description: '대기질을 고려한 최적의 이동 경로를 추천하는 서비스',
    type: 'website',
    locale: 'ko_KR',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className={inter.className}>
        <Script
          src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_MAP_KEY}&autoload=false`}
          strategy="beforeInteractive"
        />
        <div id="root">
          {children}
        </div>
      </body>
    </html>
  );
}
