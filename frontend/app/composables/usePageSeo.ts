export function usePageSeo(
  title: string,
  description = "Спортивный клуб K-Dojo в Королёве. Киокусинкай, BJJ и Маугли. Первая тренировка бесплатно.",
) {
  const route = useRoute();
  const config = useRuntimeConfig();
  const canonical = new URL(route.path, config.public.siteUrl).toString();
  useSeoMeta({
    title: `${title} — K-Dojo`,
    description,
    ogTitle: `${title} — K-Dojo`,
    ogDescription: description,
    ogType: "website",
    ogUrl: canonical,
    twitterCard: "summary_large_image",
  });
  useHead({ link: [{ rel: "canonical", href: canonical }] });
}
