import { useEffect, useState } from 'react';
import { supabase } from './supabase';
import type { BlogPost, MediaItem, Quote, AuraEvent, GalleryImage, MediaCategory } from './adminApi';

export function useSupabaseQuery<T>(
  key: string,
  fetcher: () => Promise<T[]>
): { data: T[]; loading: boolean; error: string | null } {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetcher()
      .then((res) => {
        if (active) {
          setData(res);
          setError(null);
        }
      })
      .catch((err: unknown) => {
        if (active) setError(err instanceof Error ? err.message : String(err));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [key]);

  return { data, loading, error };
}

export const publicApi = {
  blogPosts: () => Promise.resolve(
    supabase
      .from('blog_posts')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) throw error;
        return (data ?? []) as BlogPost[];
      })
  ),

  blogPost: (id: string) => Promise.resolve(
    supabase
      .from('blog_posts')
      .select('*')
      .eq('id', id)
      .eq('status', 'published')
      .maybeSingle()
      .then(({ data, error }) => {
        if (error) throw error;
        return data as BlogPost | null;
      })
  ),

  mediaByCategory: (category: MediaCategory) => Promise.resolve(
    supabase
      .from('media_items')
      .select('*')
      .eq('category', category)
      .eq('status', 'published')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) throw error;
        return (data ?? []) as MediaItem[];
      })
  ),

  quotes: () => Promise.resolve(
    supabase
      .from('quotes')
      .select('*')
      .eq('status', 'published')
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) throw error;
        return (data ?? []) as Quote[];
      })
  ),

  events: () => Promise.resolve(
    supabase
      .from('events')
      .select('*')
      .eq('status', 'published')
      .order('event_date', { ascending: true })
      .then(({ data, error }) => {
        if (error) throw error;
        return (data ?? []) as AuraEvent[];
      })
  ),

  gallery: () => Promise.resolve(
    supabase
      .from('gallery_images')
      .select('*')
      .eq('status', 'published')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })
      .then(({ data, error }) => {
        if (error) throw error;
        return (data ?? []) as GalleryImage[];
      })
  ),

  settings: () =>
    Promise.resolve(
      supabase
        .from('site_settings')
        .select('*')
        .eq('id', 1)
        .maybeSingle()
        .then(({ data, error }) => {
          if (error) throw error;
          return data;
        })
    ),
};

export function useBlogPosts() {
  return useSupabaseQuery('blog-posts', () => publicApi.blogPosts());
}
export function useMediaByCategory(category: MediaCategory) {
  return useSupabaseQuery(`media-${category}`, () => publicApi.mediaByCategory(category));
}
export function useQuotes() {
  return useSupabaseQuery('quotes', () => publicApi.quotes());
}
export function useEvents() {
  return useSupabaseQuery('events', () => publicApi.events());
}
export function useGallery() {
  return useSupabaseQuery('gallery', () => publicApi.gallery());
}
