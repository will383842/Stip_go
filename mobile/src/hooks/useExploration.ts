import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useExplorationStore } from '../stores/useExplorationStore';
import type { ApiResponse } from '../types';

interface CoverageResponse {
  city: string;
  coverage_percent: number;
  explored_tiles: number;
  total_tiles: number;
}

interface TilesResponse {
  tiles: string[];
  count: number;
}

export function useCoverage(city?: string) {
  const { setCoveragePercent, setCurrentCity } = useExplorationStore();

  return useQuery({
    queryKey: ['coverage', city],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<CoverageResponse>>('/exploration/coverage', {
        params: { city },
      });
      setCoveragePercent(data.data.coverage_percent);
      if (city) setCurrentCity(city);
      return data.data;
    },
    enabled: !!city,
    staleTime: 5 * 60_000,
  });
}

export function useExploredTiles(bbox?: string) {
  const { setExploredTiles } = useExplorationStore();

  return useQuery({
    queryKey: ['explored-tiles', bbox],
    queryFn: async () => {
      const { data } = await api.get<ApiResponse<TilesResponse>>('/exploration/tiles', {
        params: { bbox },
      });
      setExploredTiles(data.data.tiles);
      return data.data;
    },
    enabled: !!bbox,
    staleTime: 60_000,
  });
}
