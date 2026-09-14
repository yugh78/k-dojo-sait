export interface Program {
  id: number;
  name: string;
  slug: string;
  short_description: string;
  description: string;
  audience: string;
  minimum_age: number | null;
  maximum_age: number | null;
  training_steps: string;
  first_training: string;
  equipment: string;
  image: string;
  accent: string;
}
export interface Coach {
  id: number;
  full_name: string;
  slug: string;
  photo: string;
  short_description: string;
  biography: string;
  qualifications: string;
  achievements: string;
  experience: string;
  programs: string[];
  certificates: { id: number; title: string; image: string }[];
}
export interface Location {
  id: number;
  name: string;
  slug: string;
  address: string;
  latitude: string | null;
  longitude: string | null;
  entrance: string;
  phone: string;
  route_url: string;
  programs: number[];
  photo: string;
}
export interface ScheduleEntry {
  id: number;
  program: Program;
  training_group: { id: number; name: string };
  location: Location | null;
  coaches: Coach[];
  weekday: number;
  start_time: string;
  end_time: string;
  minimum_age: number | null;
  maximum_age: number | null;
  audience: string;
  notes: string;
}
export interface PricingPlan {
  id: number;
  name: string;
  slug: string;
  price: string;
  billing_period: string;
  sessions_per_week: number | null;
  unlimited: boolean;
  description: string;
  eligibility: string;
  programs: number[];
  category: string;
}
export interface Discount {
  id: number;
  name: string;
  discount_type: string;
  discount_value: string;
  description: string;
  eligibility_text: string;
}
export interface GalleryImage {
  id: number;
  image: string;
  image_webp: string;
  image_avif: string;
  caption: string;
}
export interface Album {
  id: number;
  title: string;
  slug: string;
  category: string;
  cover: string;
  images: GalleryImage[];
}
export interface ClubEvent {
  id: number;
  title: string;
  slug: string;
  program: string | null;
  event_type: string;
  start_date: string;
  end_date: string | null;
  location: string;
  age_text: string;
  description: string;
  content: string;
  cover_image: string;
  gallery: Album | null;
  price: string | null;
  registration_available: boolean;
}
export interface Competition {
  id: number;
  title: string;
  slug: string;
  date: string;
  location: string;
  description: string;
  cover_image: string;
}
export interface Result {
  id: number;
  competition: Competition;
  athlete: { full_name: string; photo: string };
  category: string;
  place: number | null;
  result_text: string;
}
export interface FAQ {
  id: number;
  question: string;
  answer: string;
  program: number | null;
}
export interface SiteSettings {
  name: string;
  phone: string;
  telegram: string;
  email: string;
  city: string;
  hero_text: string;
  hero_image: string;
  cta_text: string;
  about_text: string;
  seo_description: string;
  privacy_text: string;
  consent_text: string;
  legal_ready: boolean;
}
