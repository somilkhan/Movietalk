import { useMyWatchlist } from './useUserData';

export function useWatchlist(isLoggedIn: boolean) {
  const { data, isLoading } = useMyWatchlist();
  return {
    watchlist: isLoggedIn && Array.isArray(data) ? data : [],
    isLoading: isLoggedIn ? isLoading : false,
  };
}
