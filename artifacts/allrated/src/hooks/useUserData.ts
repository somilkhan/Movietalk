import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  fetchTitleRating,
  fetchWatchlistStatus,
  rateTitle,
  unrateTitle,
  addToWatchlist,
  removeFromWatchlist,
  fetchMyRatings,
  fetchMyWatchlist,
  type TitleSnapshot,
} from '@/lib/userApi';

// Per-title rating
export function useTitleRating(mediaType: string, titleId: number) {
  return useQuery({
    queryKey: ['rating', mediaType, titleId],
    queryFn: () => fetchTitleRating(mediaType, titleId),
    staleTime: 60_000,
  });
}

export function useRateMutation(mediaType: 'movie' | 'tv', titleId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ rating, snapshot }: { rating: number; snapshot: TitleSnapshot }) =>
      rateTitle(titleId, mediaType, rating, snapshot),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rating', mediaType, titleId] });
      qc.invalidateQueries({ queryKey: ['myRatings'] });
    },
  });
}

export function useUnrateMutation(mediaType: string, titleId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => unrateTitle(mediaType, titleId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['rating', mediaType, titleId] });
      qc.invalidateQueries({ queryKey: ['myRatings'] });
    },
  });
}

// Per-title watchlist status
export function useWatchlistStatus(mediaType: string, titleId: number) {
  return useQuery({
    queryKey: ['watchlist', mediaType, titleId],
    queryFn: () => fetchWatchlistStatus(mediaType, titleId),
    staleTime: 60_000,
  });
}

export function useWatchlistMutation(mediaType: 'movie' | 'tv', titleId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ snapshot }: { snapshot: TitleSnapshot }) =>
      addToWatchlist(titleId, mediaType, snapshot),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['watchlist', mediaType, titleId] });
      qc.invalidateQueries({ queryKey: ['myWatchlist'] });
    },
  });
}

export function useUnwatchlistMutation(mediaType: string, titleId: number) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => removeFromWatchlist(mediaType, titleId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['watchlist', mediaType, titleId] });
      qc.invalidateQueries({ queryKey: ['myWatchlist'] });
    },
  });
}

// Full lists for Space page
export function useMyRatings() {
  return useQuery({ queryKey: ['myRatings'], queryFn: fetchMyRatings });
}

export function useMyWatchlist() {
  return useQuery({ queryKey: ['myWatchlist'], queryFn: fetchMyWatchlist });
}
