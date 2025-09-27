'use client';

import React, { useState, useCallback } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Input, Icon } from '@/components/atoms';
import { useRoute } from '@/hooks/useRoute';
import { validateAddress } from '@/utils/validation';
import { cn } from '@/utils/helpers';
import type { Location } from '@/types';

interface SearchFormProps {
  startLocation?: Location;
  endLocation?: Location;
  onSearch: () => void;
  canSearch: boolean;
  className?: string;
}

interface FormData {
  startAddress: string;
  endAddress: string;
}

export default function SearchForm({
  startLocation,
  endLocation,
  onSearch,
  canSearch,
  className,
}: SearchFormProps) {
  const {
    setStartLocation,
    setEndLocation,
    swapLocations,
    isSearching,
  } = useRoute();

  const [isGeocoding, setIsGeocoding] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<FormData>({
    defaultValues: {
      startAddress: startLocation?.address || '',
      endAddress: endLocation?.address || '',
    },
  });

  const watchedStartAddress = watch('startAddress');
  const watchedEndAddress = watch('endAddress');

  // 주소 검색 (지오코딩)
  const geocodeAddress = useCallback(async (address: string): Promise<Location | null> => {
    if (!address.trim()) return null;

    try {
      const geocoder = new kakao.maps.services.Geocoder();
      
      return new Promise((resolve) => {
        geocoder.addressSearch(address, (result: unknown, status: unknown) => {
          if (status === kakao.maps.services.Status.OK && Array.isArray(result) && result.length > 0) {
            const coords = result[0] as any;
            resolve({
              name: coords.address_name,
              address: coords.address_name,
              coordinate: {
                latitude: parseFloat(coords.y),
                longitude: parseFloat(coords.x),
              },
            });
          } else {
            resolve(null);
          }
        });
      });
    } catch (error) {
      console.error('지오코딩 오류:', error);
      return null;
    }
  }, []);

  // 주소 입력 완료 시 지오코딩 실행
  const handleAddressBlur = useCallback(async (field: 'start' | 'end', address: string) => {
    if (!address.trim()) return;

    setIsGeocoding(true);
    
    try {
      const location = await geocodeAddress(address);
      
      if (location) {
        if (field === 'start') {
          setStartLocation(location);
        } else {
          setEndLocation(location);
        }
      }
    } catch (error) {
      console.error('주소 검색 실패:', error);
    } finally {
      setIsGeocoding(false);
    }
  }, [geocodeAddress, setStartLocation, setEndLocation]);

  // 폼 제출
  const onSubmit = useCallback((data: FormData) => {
    if (canSearch) {
      onSearch();
    }
  }, [canSearch, onSearch]);

  // 위치 교체
  const handleSwapLocations = useCallback(() => {
    const startAddr = watchedStartAddress;
    const endAddr = watchedEndAddress;
    
    setValue('startAddress', endAddr);
    setValue('endAddress', startAddr);
    
    swapLocations();
  }, [watchedStartAddress, watchedEndAddress, setValue, swapLocations]);

  // 현재 위치 설정
  const setCurrentLocation = useCallback(async (field: 'start' | 'end') => {
    if (typeof window === 'undefined' || !navigator.geolocation) {
      alert('이 브라우저는 위치 서비스를 지원하지 않습니다.');
      return;
    }

    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject);
      });

      const location: Location = {
        name: '현재 위치',
        address: '현재 위치',
        coordinate: {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        },
      };

      if (field === 'start') {
        setStartLocation(location);
        setValue('startAddress', '현재 위치');
      } else {
        setEndLocation(location);
        setValue('endAddress', '현재 위치');
      }
    } catch (error) {
      console.error('현재 위치 가져오기 실패:', error);
      alert('현재 위치를 가져올 수 없습니다.');
    }
  }, [setStartLocation, setEndLocation, setValue]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={cn('space-y-4', className)}>
      {/* 출발지 입력 */}
      <Input
        {...register('startAddress', {
          required: '출발지를 입력해주세요',
          validate: (value) => {
            const validation = validateAddress(value);
            return validation.isValid || validation.error;
          },
        })}
        label="출발지"
        placeholder="출발지를 입력하세요"
        leftIcon={<Icon name="location" size="sm" />}
        rightIcon={
          <button
            type="button"
            onClick={() => setCurrentLocation('start')}
            className="text-primary-600 hover:text-primary-700"
            title="현재 위치로 설정"
          >
            📍
          </button>
        }
        error={errors.startAddress?.message}
        onBlur={(e) => handleAddressBlur('start', e.target.value)}
      />

      {/* 위치 교체 버튼 */}
      <div className="flex justify-center">
        <button
          type="button"
          onClick={handleSwapLocations}
          className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
          title="출발지와 도착지 교체"
        >
          <Icon name="arrow-right" size="sm" className="rotate-90" />
        </button>
      </div>

      {/* 도착지 입력 */}
      <Input
        {...register('endAddress', {
          required: '도착지를 입력해주세요',
          validate: (value) => {
            const validation = validateAddress(value);
            return validation.isValid || validation.error;
          },
        })}
        label="도착지"
        placeholder="도착지를 입력하세요"
        leftIcon={<Icon name="location" size="sm" />}
        rightIcon={
          <button
            type="button"
            onClick={() => setCurrentLocation('end')}
            className="text-primary-600 hover:text-primary-700"
            title="현재 위치로 설정"
          >
            📍
          </button>
        }
        error={errors.endAddress?.message}
        onBlur={(e) => handleAddressBlur('end', e.target.value)}
      />

      {/* 검색 버튼 */}
      <Button
        type="submit"
        variant="primary"
        size="lg"
        loading={isSearching || isGeocoding}
        disabled={!canSearch || isSearching || isGeocoding}
        className="w-full"
      >
        {isSearching || isGeocoding ? (
          <>
            {isGeocoding ? '주소 검색 중...' : '경로 검색 중...'}
          </>
        ) : (
          <>
            <Icon name="search" size="sm" className="mr-2" />
            경로 검색
          </>
        )}
      </Button>

      {/* 검색 상태 표시 */}
      {isGeocoding && (
        <div className="text-center text-sm text-gray-500">
          주소를 검색하고 있습니다...
        </div>
      )}
    </form>
  );
}
