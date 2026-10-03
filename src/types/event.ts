export type EventType = 'virtual' | 'in-person' | 'hybrid';
export type EventStatus = 'draft' | 'published';
export type EventTimeline = 'upcoming' | 'past';

export interface EventItem {
  id: string;
  title: string;
  slug: string;
  summary: string;
  description: string;
  banner?: string;
  bannerPublicId?: string;
  images?: string[];
  videoUrl?: string;
  recordingUrl?: string;
  startDate: string;
  endDate?: string;
  timezone?: string;
  eventType: EventType;
  eventUrl?: string;     // Meeting URL (e.g. Zoom, Google Meet)
  location?: string;     // Physical address
  category: string;      // e.g. "Webinar", "Workshop", "Meetup"
  tags?: string[];
  status: EventStatus;
  isFeatured: boolean;
  createdById?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface EventsResponse {
  events: EventItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface EventsQueryParams {
  timeline?: EventTimeline;
  category?: string;
  featured?: boolean;
  search?: string;
  page?: number;
  limit?: number;
}
