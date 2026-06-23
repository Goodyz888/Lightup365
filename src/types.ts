export type Theme = 'light' | 'dark';
export type Language = 'en' | 'zh';

export interface PatchOption {
  id: string;
  name: string;
  description: string;
  benefits: string[];
  points: string[];
}

export interface KnowledgeBaseEntry {
  id: string;
  lang?: Language;
  title: string;
  content: string;
  category: 'science' | 'corporate' | 'product' | 'business';
  tags: string[];
}

export interface SocialUpdate {
  id: string;
  type: 'youtube' | 'tiktok' | 'reddit' | 'facebook' | 'link';
  url: string;
  content: string;
  timestamp: string;
}
