import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { AuthService } from '../../services/auth.service';

// La página de inicio muestra accesos distintos según la cuenta que ha iniciado sesión.
@Component({
  selector: 'app-home',
  imports: [RouterLink],
  templateUrl: './home.html',
})
export class Home {
  auth = inject(AuthService);
}
