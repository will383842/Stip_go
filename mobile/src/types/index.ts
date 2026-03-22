// === User types ===

export interface User {
  id: string;
  name: string;
  username: string;
  email?: string;
  phone?: string;
  apple_id?: string;
  google_id?: string;
  avatar_url?: string;
  locale: string;
  country_code?: string;
  timezone?: string;
  birth_year?: number;
  onboarding_step: number;
  is_premium: boolean;
  level: number;
  miles_balance: number;
  ref_code: string;
  referral_count: number;
  total_stamps: number;
  top_stamps: StampSummary[];
  passport_level_name: string;
  profile_mood?: string;
  profile_color: string;
  pinned_countries: string[];
  home_city_id?: number;
  home_country_code?: string;
  created_at: string;
  updated_at: string;
}

export interface StampSummary {
  stamp_type: StampType;
  name: string;
  country_code: string;
}

export interface UserSettings {
  visible_clusters: boolean;
  visible_dating: boolean;
  visible_family: boolean;
  visible_parcours: 'public' | 'friends' | 'private';
  dark_mode: 'dark' | 'light' | 'system';
  notification_push: boolean;
  notification_email: boolean;
  notification_social: boolean;
  notification_engagement: boolean;
  notification_marketing: boolean;
  text_size: 'small' | 'normal' | 'large';
  sounds_enabled: boolean;
  haptic_enabled: boolean;
  family_mode: boolean;
  quiet_hours_start: string;
  quiet_hours_end: string;
  auto_share_stamps: boolean;
  default_stamp_template: StampTemplate;
  notification_nearby_spots: boolean;
  notification_friend_stamps: boolean;
  night_visibility_hidden: boolean;
  visibility_contacted_only: boolean;
}

// === Stamp types ===

export type StampType = 'spot' | 'city' | 'region' | 'country';
export type StampSource = 'gps' | 'imported' | 'declared';
export type StampTemplate = 'minimal' | 'carte' | 'passport' | 'photo' | 'gradient';

export interface Stamp {
  id: string;
  user_id: string;
  stamp_type: StampType;
  country_code: string;
  region_name?: string;
  city_name?: string;
  spot_name?: string;
  spot_category?: string;
  source: StampSource;
  stamped_at: string;
  animation_seen: boolean;
  shared: boolean;
  is_golden: boolean;
  visits_count: number;
}

export interface Badge {
  id: number;
  code: string;
  name: Record<string, string>;
  description: Record<string, string>;
  icon_url: string;
  category: 'spot' | 'city' | 'region' | 'country' | 'special' | 'manual';
  trigger_type: 'auto' | 'manual';
}

export interface UserBadge {
  badge: Badge;
  earned_at: string;
  is_pinned: boolean;
}

export interface PassportLevel {
  level: number;
  name: Record<string, string>;
  min_stamps: number;
  icon_url: string;
}

export interface Country {
  code: string;
  name: Record<string, string>;
  is_active: boolean;
  currency_code: string;
  phone_prefix: string;
}

// === Geo types ===

export interface Position {
  lat: number;
  lng: number;
  accuracy?: number;
  speed?: number;
  altitude?: number;
  battery_level?: number;
  recorded_at: string;
}

export interface Cluster {
  lat: number;
  lng: number;
  count: number;
}

// === Passport types ===

export interface StampedCountry {
  country_code: string;
  source: StampSource;
}

export interface PassportData {
  stamps: Stamp[];
  stamped_countries: StampedCountry[];
  badges: UserBadge[];
  stats: PassportStats;
  level: PassportLevel;
  next_level?: PassportLevel;
}

export interface PassportStats {
  total_stamps: number;
  countries_visited: number;
  verified_countries: number;
  declared_countries: number;
  cities_visited: number;
  regions_visited: number;
  spots_visited: number;
  days_active: number;
}

export interface DeclareCountriesResponse {
  declared_count: number;
  ignored_count: number;
  total_countries: number;
}

// === Notification types ===

export interface AppNotification {
  id: string;
  type: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  read_at?: string;
  created_at: string;
}

// === API types ===

export interface ApiResponse<T> {
  data: T;
  meta?: {
    cursor?: string | null;
    has_more?: boolean;
    message?: string;
    // Legacy Sprint 1-2 nested format (usePassport, useNotifications)
    pagination?: {
      cursor: string | null;
      has_more: boolean;
    };
  };
  errors?: ApiError[];
}

export interface ApiError {
  code: string;
  message: string;
  field?: string;
}

// === Auth types ===

export interface SocialAuthPayload {
  provider: 'apple' | 'google';
  id_token: string;
  nonce?: string;
}

export interface EmailOtpPayload {
  email: string;
}

export interface OtpVerifyPayload {
  email: string;
  code: string;
}

export interface AuthResponse {
  user: User;
  token: string;
  refresh_token: string;
  is_new_user: boolean;
}

export interface ProfileUpdatePayload {
  name?: string;
  username?: string;
  avatar_url?: string;
  birth_year?: number;
  onboarding_step?: number;
  locale?: string;
  profile_mood?: string;
  profile_color?: string;
}

export interface PositionBatchPayload {
  positions: Position[];
}

export interface ClusterQuery {
  zoom: number;
  bbox: string;
}

export interface ReportPayload {
  reported_user_id: string;
  type: string;
  description: string;
}

export interface AppVersion {
  min_version: string;
  latest_version: string;
  update_url?: string;
}

export interface PublicProfile {
  id: string;
  name: string;
  username: string;
  avatar_url?: string;
  total_stamps: number;
  passport_level_name: string;
  top_stamps: StampSummary[];
  badges: UserBadge[];
  country_code?: string;
}

// === Sprint 3-4: Social types ===

// Friendships
export interface Friendship {
  id: string;
  user_id: string;
  friend_id: string;
  status: 'pending' | 'accepted' | 'blocked';
  friend?: PublicProfile;
  created_at: string;
}

// DM
export interface Conversation {
  id: string;
  user_a_id: string;
  user_b_id: string;
  type: 'dm' | 'system';
  last_message_at?: string;
  last_message_preview?: string;
  unread_count: number;
  common_stamps_count: number;
  other_user: PublicProfile;
  created_at: string;
}

export interface DirectMessage {
  id: string;
  conversation_id: string;
  sender_user_id: string;
  content: string;
  photo_url?: string;
  audio_url?: string;
  audio_duration_sec?: number;
  reactions: MessageReaction[];
  read_at?: string;
  created_at: string;
}

export interface MessageReaction {
  user_id: string;
  emoji: string;
}

export interface SendMessagePayload {
  receiver_user_id: string;
  content: string;
  photo_url?: string;
  audio_url?: string;
  audio_duration_sec?: number;
}

// Shouts
export interface ShoutParticipant {
  shout_id: string;
  user_id: string;
  user?: PublicProfile;
  joined_at: string;
}

export interface Shout {
  id: string;
  user_id: string;
  user?: PublicProfile;
  location: { lat: number; lng: number };
  message: string;
  radius_meters: number;
  expires_at: string;
  participants_count: number;
  participants?: ShoutParticipant[];
  is_minor: boolean;
  created_at: string;
}

// Squad
export interface Squad {
  id: string;
  name: string;
  emoji: string;
  creator_user_id: string;
  invite_code: string;
  total_stamps: number;
  current_streak: number;
  max_streak: number;
  member_count: number;
  is_temporary: boolean;
  expires_at?: string;
  members?: SquadMember[];
  created_at: string;
}

export interface SquadMember {
  squad_id: string;
  user_id: string;
  user?: PublicProfile;
  color: string;
  role: 'creator' | 'member';
  weekly_stamps: number;
  total_stamps: number;
  last_stamp_at?: string;
  joined_at: string;
}

export interface SquadStamp {
  id: string;
  squad_id: string;
  user_id: string;
  user?: PublicProfile;
  stamp_type: string;
  location?: { lat: number; lng: number };
  photo_url?: string;
  caption?: string;
  is_together: boolean;
  created_at: string;
}

export interface CreateSquadPayload {
  name: string;
  emoji: string;
}

export interface CreateSquadStampPayload {
  stamp_type: string;
  lat: number;
  lng: number;
  photo_url?: string;
  caption?: string;
}

// Squad colors
export const SQUAD_COLORS = [
  '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
  '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
] as const;

// Stamp Flash
export interface StampFlash {
  id: string;
  location: { lat: number; lng: number };
  name: string;
  expires_at: string;
  captured: boolean;
  miles_bonus: number;
}

// Pépites
export interface Pepite {
  id: string;
  user_id: string;
  user?: PublicProfile;
  location: { lat: number; lng: number };
  photo_url: string;
  caption?: string;
  votes_count: number;
  has_voted?: boolean;
  can_vote?: boolean;
  is_active: boolean;
  created_at: string;
}

export interface CreatePepitePayload {
  lat: number;
  lng: number;
  photo_url: string;
  caption?: string;
}

// Terra Incognita
export interface ExploredTile {
  h3_index: string;
  first_visited_at: string;
}

export interface CoverageData {
  city: string;
  percentage: number;
  total_tiles: number;
  explored_tiles: number;
}

// Feed
export type FeedEventType = 'stamp' | 'level_up' | 'badge' | 'squad_join' | 'flash_capture' | 'country' | 'pepite_created' | 'milestone';

export interface FeedItem {
  id: string;
  user_id: string;
  user?: PublicProfile;
  type: FeedEventType;
  content: Record<string, unknown>;
  created_at: string;
}
