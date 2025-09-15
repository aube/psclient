export interface Upload {
  id: number;
  site_id: number;
  user_id: number;
  uuid: string;
  name: string;
  category: string;
  size: string;
  content_type: string;
  description: string;
  created_at: Date;
  updated_at: Date;
  deleted: boolean;
}

export interface UploadNew extends Omit<Upload, 'id' | 'created_at' | 'updated_at'> {
  id?: number;
  created_at?: Date;
  updated_at?: Date;
}

export type Uploads = Upload[]

