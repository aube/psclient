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
}

export interface CreateSite extends Omit<Site, 'id' | 'created_at' | 'updated_at'> {
  id?: number;
  created_at?: Date;
  updated_at?: Date;
}