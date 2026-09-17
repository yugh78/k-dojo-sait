export function useClubApi<T>(path: string) {
  return useFetch<T>(`/api/${path}/`, {
    key: `club:${path}`,
    getCachedData: (key, app, context) =>
      context.cause === "refresh:manual"
        ? undefined
        : (app.payload.data[key] ?? app.static.data[key]),
  });
}
