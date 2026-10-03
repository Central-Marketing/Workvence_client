import axiosFetch from "@/utils/axiosFetch";
import { EventItem, EventsQueryParams, EventsResponse } from "@/types";

export const eventService = {
  /**
   * Fetch paginated events with optional filters (timeline, category, search, featured, page, limit)
   */
  async getEvents(params?: EventsQueryParams): Promise<EventsResponse> {
    const res = await axiosFetch.get<EventsResponse>("/events", {
      params: {
        timeline: params?.timeline,
        category: params?.category && params.category !== "All" ? params.category : undefined,
        featured: params?.featured,
        search: params?.search?.trim() || undefined,
        page: params?.page || 1,
        limit: params?.limit || 12,
      },
    });
    return res.data;
  },

  /**
   * Fetch single event details by slug or ID
   */
  async getEventBySlug(idOrSlug: string): Promise<EventItem> {
    const res = await axiosFetch.get<EventItem>(`/events/${encodeURIComponent(idOrSlug)}`);
    return res.data;
  },
};
