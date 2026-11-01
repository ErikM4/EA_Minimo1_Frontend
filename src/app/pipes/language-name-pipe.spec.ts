import { LanguageNamePipe } from './language-name-pipe';

describe('LanguageNamePipe', () => {
  const pipe = new LanguageNamePipe();

  it('cambia el código de idioma por su nombre', () => {
    expect(pipe.transform('es')).toBe('Castellano');
    expect(pipe.transform('ca')).toBe('Catalán');
    expect(pipe.transform('en')).toBe('Inglés');
  });

  it('si no conoce el código, lo deja tal cual', () => {
    expect(pipe.transform('fr')).toBe('fr');
  });

  it('si no hay idioma, devuelve un texto vacío', () => {
    expect(pipe.transform(undefined)).toBe('');
  });
});
