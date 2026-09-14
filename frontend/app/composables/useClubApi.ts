export function useClubApi<T>(path: string) {
  return useFetch<T>(`/api/${path}/`, { key: `club:${path}` });
}
