import { Pagination } from './Pagination.types'

export interface Site {
  id: number;
  name: string;
  domain: string;
  meta: string;
  title: string;
  categry: string;
  template: string;
  settings: string;
  created_at: Date;
  updated_at: Date;
  deleted: boolean;
  icon?: string;
}

export interface SiteNew {
  name: string;
}

export type Sites = Site[]

export interface SitesList {
  rows: Sites,
  pagination: Pagination,
}
