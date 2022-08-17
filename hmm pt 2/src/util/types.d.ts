export interface Root {
  id: string;
  username: string;
  discriminator: number;
  email: string;
  verified: boolean;
  avatar_hash: string;
  has_mobile: boolean;
  needs_email_verification: boolean;
  premium_until: string;
  flags: number;
  phone: string;
  temp_banned_until: any;
  ip: string;
  settings: Settings;
  connections: Connection[];
  external_friends_lists: any[];
  friend_suggestions: any[];
  mfa_sessions: MfaSession[];
  relationships: Relationship[];
  payments: Payment[];
  payment_sources: PaymentSource2[];
  guild_settings: GuildSetting[];
  library_applications: LibraryApplication[];
  entitlements: Entitlement2[];
  user_activity_application_statistics: UserActivityApplicationStatistic[];
  notes: Notes;
}

export interface Settings {
  locale: string;
  show_current_game: boolean;
  restricted_guilds: any[];
  default_guilds_restricted: boolean;
  inline_attachment_media: boolean;
  inline_embed_media: boolean;
  gif_auto_play: boolean;
  render_embeds: boolean;
  render_reactions: boolean;
  animate_emoji: boolean;
  enable_tts_command: boolean;
  message_display_compact: boolean;
  convert_emoticons: boolean;
  explicit_content_filter: number;
  disable_games_tab: boolean;
  theme: string;
  developer_mode: boolean;
  guild_positions: string[];
  detect_platform_accounts: boolean;
  status: string;
  afk_timeout: number;
  timezone_offset: number;
  stream_notifications_enabled: boolean;
  allow_accessibility_detection: boolean;
  contact_sync_enabled: boolean;
  native_phone_integration_enabled: boolean;
  animate_stickers: number;
  friend_discovery_flags: number;
  view_nsfw_guilds: boolean;
  passwordless: boolean;
  friend_source_flags: FriendSourceFlags;
  guild_folders: GuildFolder[];
  custom_status: any;
}

export interface FriendSourceFlags {
  all: boolean;
}

export interface GuildFolder {
  guild_ids: string[];
  id: any;
  name?: string;
  color?: number;
}

export interface Connection {
  type: string;
  id: string;
  name: string;
  revoked: boolean;
  visibility: number;
  friend_sync: boolean;
  show_activity: boolean;
  verified: boolean;
}

export interface MfaSession {
  user_id: string;
  started: number;
  ip: string;
  e: string;
  id: string;
}

export interface Relationship {
  id: string;
  type: number;
  nickname?: string;
  user: User;
}

export interface User {
  id: string;
  username: string;
  avatar?: string;
  discriminator: string;
  public_flags: number;
  bot?: boolean;
}

export interface Payment {
  id: string;
  created_at: string;
  currency: string;
  tax: number;
  tax_inclusive: boolean;
  amount: number;
  amount_refunded: number;
  status: number;
  description: string;
  flags: number;
  payment_source: PaymentSource;
  sku_id: string;
  sku_price: number;
  sku_subscription_plan_id?: string;
  subscription?: Subscription;
}

export interface PaymentSource {
  id: string;
  type: number;
  invalid: boolean;
  flags: number;
  email: string;
  billing_address: BillingAddress;
  country: string;
}

export interface BillingAddress {
  name: string;
  line_1: string;
  line_2: any;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

export interface Subscription {
  id: string;
  type: number;
  current_period_start: string;
  current_period_end: string;
  payment_gateway: any;
  payment_gateway_plan_id: string;
  currency: string;
  items: Item[];
}

export interface Item {
  id: string;
  plan_id: string;
  quantity: number;
}

export interface PaymentSource2 {
  id: string;
  type: number;
  invalid: boolean;
  flags: number;
  email: string;
  billing_address: BillingAddress2;
  country: string;
}

export interface BillingAddress2 {
  name: string;
  line_1: string;
  line_2: any;
  city: string;
  state: string;
  country: string;
  postal_code: string;
}

export interface GuildSetting {
  guild_id?: string;
  suppress_everyone: boolean;
  suppress_roles: boolean;
  message_notifications: number;
  mobile_push: boolean;
  muted: boolean;
  mute_config?: MuteConfig;
  hide_muted_channels: boolean;
  channel_overrides: ChannelOverride[];
  version: number;
}

export interface MuteConfig {
  end_time?: string;
  selected_time_window: number;
}

export interface ChannelOverride {
  channel_id: string;
  message_notifications: number;
  muted: boolean;
  mute_config?: MuteConfig2;
  collapsed: boolean;
}

export interface MuteConfig2 {
  end_time?: string;
  selected_time_window: number;
}

export interface LibraryApplication {
  application: Application;
  branch_id: string;
  sku_id: string;
  sku: Sku;
  flags: number;
  created_at: string;
  entitlements: Entitlement[];
}

export interface Application {
  id: string;
  name: string;
  icon: string;
  description: string;
  summary: string;
  primary_sku_id: string;
  hook: boolean;
  slug: string;
  guild_id: string;
  bot_public?: boolean;
  bot_require_code_grant?: boolean;
  verify_key: string;
  publishers?: Publisher[];
  developers: Developer[];
  cover_image?: string;
  terms_of_service_url?: string;
  privacy_policy_url?: string;
}

export interface Publisher {
  id: string;
  name: string;
}

export interface Developer {
  id: string;
  name: string;
}

export interface Sku {
  id: string;
  type: number;
  premium: boolean;
  preorder_release_at: any;
  preorder_approximate_release_date: any;
}

export interface Entitlement {
  id: string;
  sku_id: string;
  application_id: string;
  user_id: string;
  promotion_id: any;
  type: number;
  deleted: boolean;
  gift_code_flags: number;
  branches: string[];
  starts_at?: string;
  ends_at?: string;
  gift_code_batch_id?: string;
}

export interface Entitlement2 {
  id: string;
  sku_id: string;
  application_id: string;
  user_id: string;
  promotion_id: any;
  type: number;
  deleted: boolean;
  gift_code_flags: number;
  branches?: string[];
  gift_code_batch_id?: string;
  sku_name: string;
  consumed?: boolean;
  gifter_user_id?: string;
  subscription_plan?: SubscriptionPlan;
  parent_id?: string;
  starts_at?: string;
  ends_at?: string;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  interval: number;
  interval_count: number;
  tax_inclusive: boolean;
  sku_id: string;
}

export interface UserActivityApplicationStatistic {
  application_id: string;
  last_played_at: string;
  total_duration: number;
  total_discord_sku_duration: number;
}

export type Notes = Record<string, string>;