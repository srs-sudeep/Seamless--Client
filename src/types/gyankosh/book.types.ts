export interface BookItem {
  item_id: number;
  barcode: string;
  call_number: string;
  location: string;
  home_library: string;
  holding_library: string;
  status: 'available' | 'checked_out';
  due_date: string | null;
  last_seen: string;
}

export interface Book {
  biblio_id: number;
  title: string;
  author: string;
  subject: string;
  isbn: string;
  series: string;
  call_number: string;
  cover_image_url: string | null;
  status: 'available' | 'checked_out';
  total_copies: number;
  available_copies: number;
  items: BookItem[];
}

export type BooksResponse = Book[];
