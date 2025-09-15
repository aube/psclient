export interface Upload {
  uuid: string;
  site_id: number;
  user_id: number;
  name: string;
  category: string;
  size: string;
  content_type: string;
  description: string;
  created_at: Date;
  updated_at: Date;
  deleted: boolean;
}

export interface UploadNew extends Omit<Upload, 'uuid' | 'created_at' | 'updated_at'> {
  uuid?: number;
  created_at?: Date;
  updated_at?: Date;
}

export type Uploads = Upload[]

