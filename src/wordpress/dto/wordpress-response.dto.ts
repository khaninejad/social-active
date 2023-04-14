export interface WordpressResponse {
  _links: Links;
  aioseo_notices: any[];
  amp_enabled: boolean;
  author: number;
  categories: number[];
  comment_status: string;
  content: Content;
  date: Date;
  date_gmt: Date;
  excerpt: Content;
  featured_media: number;
  format: string;
  generated_slug: string;
  guid: GUID;
  id: number;
  jetpack_featured_media_url: string;
  link: string;
  meta: any[];
  modified: Date;
  modified_gmt: Date;
  password: string;
  permalink_template: string;
  ping_status: string;
  slug: string;
  status: string;
  sticky: boolean;
  tags: any[];
  template: string;
  title: GUID;
  type: string;
}

export interface Links {
  about: About[];
  author: Author[];
  collection: About[];
  curies: Cury[];
  replies: Author[];
  self: About[];
  "version-history": VersionHistory[];
  "wp:action-assign-author": About[];
  "wp:action-assign-categories": About[];
  "wp:action-assign-tags": About[];
  "wp:action-create-categories": About[];
  "wp:action-create-tags": About[];
  "wp:action-publish": About[];
  "wp:action-sticky": About[];
  "wp:action-unfiltered-html": About[];
  "wp:attachment": About[];
  "wp:term": WpTerm[];
}

export interface About {
  href: string;
}

export interface Author {
  embeddable: boolean;
  href: string;
}

export interface Cury {
  href: string;
  name: string;
  templated: boolean;
}

export interface VersionHistory {
  count: number;
  href: string;
}

export interface WpTerm {
  embeddable: boolean;
  href: string;
  taxonomy: string;
}

export interface Content {
  block_version?: number;
  protected: boolean;
  raw: string;
  rendered: string;
}

export interface GUID {
  raw: string;
  rendered: string;
}
