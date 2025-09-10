export interface Page {
  id: number;
  site_id: number;
  name: string;
  meta: string;
  title: string;
  category: string;
  template: string;
  h1: string;
  content: string;
  content_short: string;
  created_at: Date;
  updated_at: Date;
  published: boolean;
  deleted: boolean;
}

export interface PageNew extends Omit<Page, 'id' | 'created_at' | 'updated_at'> {
  id?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface PageUpdate extends Partial<Omit<Page, 'id' | 'site_id'>> {
  id: number;
  site_id: number;
}