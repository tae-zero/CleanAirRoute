'use client';

import React from 'react';
import { cn } from '@/utils/helpers';

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 카드 제목 */
  title?: string;
  /** 카드 설명 */
  description?: string;
  /** 카드 크기 */
  size?: 'sm' | 'md' | 'lg';
  /** 카드 스타일 */
  variant?: 'default' | 'outlined' | 'elevated';
  /** 클릭 가능한 카드 */
  clickable?: boolean;
  /** 로딩 상태 */
  loading?: boolean;
  /** 카드 헤더 */
  header?: React.ReactNode;
  /** 카드 푸터 */
  footer?: React.ReactNode;
  /** 카드 내용 */
  children?: React.ReactNode;
}

/**
 * 기본 카드 컴포넌트
 */
const Card = React.forwardRef<HTMLDivElement, CardProps>(
  (
    {
      title,
      description,
      size = 'md',
      variant = 'default',
      clickable = false,
      loading = false,
      header,
      footer,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const sizeClasses = {
      sm: 'p-4',
      md: 'p-6',
      lg: 'p-8',
    };

    const variantClasses = {
      default: 'bg-white border border-gray-200',
      outlined: 'bg-white border-2 border-gray-300',
      elevated: 'bg-white shadow-lg border border-gray-100',
    };

    return (
      <div
        ref={ref}
        className={cn(
          'rounded-lg transition-all duration-200',
          sizeClasses[size],
          variantClasses[variant],
          clickable && 'cursor-pointer hover:shadow-md hover:scale-[1.02]',
          loading && 'animate-pulse',
          className
        )}
        {...props}
      >
        {/* 헤더 */}
        {header && (
          <div className="mb-4">
            {header}
          </div>
        )}

        {/* 제목과 설명 */}
        {(title || description) && (
          <div className="mb-4">
            {title && (
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                {title}
              </h3>
            )}
            {description && (
              <p className="text-sm text-gray-600">
                {description}
              </p>
            )}
          </div>
        )}

        {/* 내용 */}
        {children && (
          <div className="text-gray-700">
            {children}
          </div>
        )}

        {/* 푸터 */}
        {footer && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            {footer}
          </div>
        )}
      </div>
    );
  }
);

Card.displayName = 'Card';

export default Card;
