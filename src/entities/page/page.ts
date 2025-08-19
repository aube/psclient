export interface IPage {
  id: number;
  name: string;
  h1: string;
  
  meta: string;
  title: string;
  category: string;
  template: string;
  
  content: string;
  content_short: string;
  created_at: string;
  updated_at: string;
}


export interface IPages {
  rows: IPage[];
  pagination: {}
}



