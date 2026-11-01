import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';

// Página de inicio para cualquier usuario con sesión.
// Todos ven el acceso al chat; un admin ve además los accesos al backoffice.
@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
})
export class Home {
  auth = inject(AuthService);
}
