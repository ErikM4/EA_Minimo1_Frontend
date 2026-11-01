import { Pipe, PipeTransform } from '@angular/core';

const LANGUAGE_NAMES: Record<string, string> = {
  es: 'Castellano',
  ca: 'Catalán',
  en: 'Inglés',
};

// Pipe propio: la API guarda el idioma como 'es', 'ca' o 'en' y en la pantalla quiero el nombre.
// Se usa así: {{ book.language | languageName }}
@Pipe({
  name: 'languageName',
})
export class LanguageNamePipe implements PipeTransform {
  transform(code: string | undefined): string {
    if (!code) {
      return '';
    }
    return LANGUAGE_NAMES[code] ?? code;
  }
}
