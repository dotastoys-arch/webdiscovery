// Handmatige types voor het datamodel (zie supabase/migrations/0001_init.sql).
// Bij schema-wijzigingen kun je deze later vervangen door `supabase gen types`.

export type LeadStatus =
  | 'new' | 'queued' | 'contacted' | 'opened' | 'replied' | 'interested'
  | 'site_generated' | 'sent_preview' | 'followed_up' | 'won' | 'lost' | 'unsubscribed';

export type CampaignStatus = 'draft' | 'active' | 'paused' | 'completed';

export type EmailStep =
  | 'intro' | 'preview_offer' | 'followup_2day' | 'followup_final' | 'reply_interested';

export type MessageDirection = 'outbound' | 'inbound';
export type MessageStatus =
  | 'queued' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'bounced' | 'failed' | 'received';

export type SiteStatus =
  | 'draft' | 'generating' | 'ready' | 'sent' | 'revising' | 'published' | 'archived';

export type TaskType =
  | 'send_intro' | 'send_preview' | 'followup_2day' | 'followup_final'
  | 'manual_review' | 'reply_followup' | 'generate_site';
export type TaskStatus = 'pending' | 'done' | 'cancelled';

export type OrderStatus =
  | 'pending' | 'awaiting_payment' | 'paid' | 'domain_setup' | 'delivered'
  | 'cancelled' | 'refunded';

export interface CompanyProfile {
  id: string;
  name: string;
  legal_name: string | null;
  kvk_number: string | null;
  vat_number: string | null;
  address: string | null;
  postal_code: string | null;
  city: string | null;
  country: string | null;
  email: string | null;
  phone: string | null;
  website: string | null;
  sender_name: string | null;
  sender_email: string | null;
  standard_price_cents: number;
  created_at: string;
  updated_at: string;
}

export interface Lead {
  id: string;
  company_name: string;
  kvk_number: string | null;
  website_url: string | null;
  has_website: boolean | null;
  email: string | null;
  phone: string | null;
  address: string | null;
  postal_code: string | null;
  city: string | null;
  industry: string | null;
  source: string | null;
  source_ref: string | null;
  notes: string | null;
  status: LeadStatus;
  score: number | null;
  rating: number | null;
  discovered_at: string;
  created_at: string;
  updated_at: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string | null;
  status: CampaignStatus;
  daily_send_limit: number;
  created_at: string;
  updated_at: string;
}

export interface EmailTemplate {
  id: string;
  step: EmailStep;
  name: string;
  subject: string;
  body_html: string;
  body_text: string | null;
  is_active: boolean;
  created_at: string;
}

export interface Message {
  id: string;
  lead_id: string | null;
  campaign_id: string | null;
  template_id: string | null;
  step: EmailStep | null;
  direction: MessageDirection;
  status: MessageStatus;
  subject: string | null;
  body_html: string | null;
  body_text: string | null;
  provider_id: string | null;
  scheduled_at: string | null;
  sent_at: string | null;
  opened_at: string | null;
  clicked_at: string | null;
  replied_at: string | null;
  created_at: string;
}

export interface GeneratedSite {
  id: string;
  lead_id: string | null;
  status: SiteStatus;
  preview_slug: string | null;
  preview_url: string | null;
  source_website_url: string | null;
  brief: string | null;
  content: Record<string, unknown> | null;
  screenshot_url: string | null;
  viewed_at: string | null;
  view_count: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  lead_id: string | null;
  type: TaskType;
  status: TaskStatus;
  due_at: string;
  payload: Record<string, unknown> | null;
  completed_at: string | null;
  created_at: string;
}

export interface Order {
  id: string;
  lead_id: string | null;
  site_id: string | null;
  amount_cents: number;
  monthly_cents: number;
  currency: string;
  plan: string | null;
  status: OrderStatus;
  mollie_payment_id: string | null;
  domain: string | null;
  customer_name: string | null;
  customer_email: string | null;
  customer_company: string | null;
  paid_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Suppression {
  id: string;
  email: string;
  reason: string | null;
  created_at: string;
}

export interface LeadEvent {
  id: string;
  lead_id: string | null;
  type: string;
  data: Record<string, unknown> | null;
  created_at: string;
}
