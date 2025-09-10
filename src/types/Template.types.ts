export interface Template {
  id: number;
  site_id: number;
  name: string;
  html: string;
  css: string;
  json: string;
  created_at: Date;
  updated_at: Date;
  deleted: boolean;
}

export interface TemplateNew extends Omit<Template, 'id' | 'created_at' | 'updated_at'> {
  id?: number;
  created_at?: Date;
  updated_at?: Date;
}

export interface TemplateUpdate extends Partial<Omit<Template, 'id' | 'site_id'>> {
  id: number;
  site_id: number;
}