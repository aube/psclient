export interface Image {
  id: number;
  site_id: number;
  user_id: number;
  uuid: string;
  name: string;
  category: string;
  size: number;
  content_type: string;
  description: string;
  created_at: Date;
  updated_at: Date;
  deleted: boolean;
}

// Для создания новой записи (id, created_at, updated_at опциональны)
export interface CreateImage extends Omit<Image, 'id' | 'created_at' | 'updated_at'> {
  id?: number;
  created_at?: Date;
  updated_at?: Date;
}

// Для обновления записи (все поля кроме id опциональны)
export interface UpdateImage extends Partial<Omit<Image, 'id'>> {
  id: number;
}