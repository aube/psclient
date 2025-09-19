export interface Image {
  uuid: string;
  site_id: number;
  user_id: number;
  name: string;
  url: string;
  category: string;
  size: string;
  content_type: string;
  description: string;
  created_at: Date;
  updated_at: Date;
  deleted: boolean;
}

export interface ImageNew extends Omit<Image, 'uuid' | 'created_at' | 'updated_at'> {
  uuid?: number;
  created_at?: Date;
  updated_at?: Date;
}

export type Images = Image[]

