import { DatePipe, NgStyle, UpperCasePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';

import { Author } from '../../models';

// Componente de presentación: solo pinta un autor y avisa al padre
// cuando se pulsa Editar o Borrar (no navega ni llama a la API)
@Component({
  selector: 'app-author-card',
  imports: [DatePipe, UpperCasePipe, NgStyle],
  templateUrl: './author-card.html',
  styleUrl: './author-card.css',
})
export class AuthorCard {
  author = input.required<Author>();

  edit = output<Author>();
  delete = output<Author>();

  // Iniciales para el círculo de la tarjeta: primera y última palabra ("Miguel de Cervantes" -> "MC")
  initials(name: string): string {
    const words = name.split(' ').filter((word) => word);
    const first = words[0] ?? '';
    const last = words.length > 1 ? words[words.length - 1] : '';
    return (first.charAt(0) + last.charAt(0)).toUpperCase();
  }
}
