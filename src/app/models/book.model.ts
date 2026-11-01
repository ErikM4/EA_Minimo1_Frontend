import type { Author } from './author.model';

export type BookLanguage = 'es' | 'ca' | 'en';

// Los mismos valores que acepta el modelo Book del backend
export const BOOK_LANGUAGES: BookLanguage[] = ['es', 'ca', 'en'];
export const BOOK_TAGS = ['ciencia-ficcion', 'fantasia', 'novela', 'ensayo', 'poesia', 'historia'];

export interface BookInput {
  title: string;
  isbn: string;
  authors: string[];
  edition?: number;
  publisher?: string;
  publishedYear?: number;
  pages?: number;
  language?: BookLanguage;
  tags?: string[];
  price?: number;
  description?: string;
}

export interface Book extends Omit<BookInput, 'authors'> {
  _id: string;
  authors: Author[];
  createdAt?: string;
  updatedAt?: string;
}

export interface BooksPage {
  books: Book[];
  total: number;
  page: number;
  pages: number;
}

export type CreateBook = BookInput;

export type UpdateBook = Partial<BookInput>;
