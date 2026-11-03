import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';

import { User, UserInput, UserRole } from '../../models';
import { UserService } from '../../services/user.service';
import { apiErrorMessage } from '../../utils/api-error';

@Component({
  selector: 'app-user-form',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './user-form.html',
  styleUrl: './user-form.css',
})
export class UserForm implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private userService = inject(UserService);
  private router = inject(Router);

  id = input<string>();
  loading = signal(false);
  saving = signal(false);
  loadFailed = signal(false);
  error = signal('');

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2), Validators.pattern(/\S/)]],
    email: ['', [Validators.required, Validators.email]],
    role: ['USER' as UserRole, Validators.required],
    password: [''],
  });

  ngOnInit(): void {
    const id = this.id();
    if (!id) {
      // Al crear una cuenta sí se exige una contraseña nueva.
      this.form.controls.password.addValidators([Validators.required, Validators.minLength(6)]);
      return;
    }

    // Al editar, dejar la contraseña vacía significa mantener la actual.
    this.form.controls.password.addValidators(Validators.minLength(6));
    const user: User | undefined = history.state?.user;
    if (user?._id === id) {
      this.fillForm(user);
      return;
    }

    this.loading.set(true);
    this.userService.getUser(id).subscribe({
      next: ({ user: loadedUser }) => {
        this.fillForm(loadedUser);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(apiErrorMessage(err));
        this.loadFailed.set(true);
        this.loading.set(false);
      },
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const id = this.id();
    const { name, email, role, password } = this.form.getRawValue();
    // Se limpian los espacios y solo se envía la contraseña si se ha escrito una.
    const payload: UserInput = {
      name: name.trim(),
      email: email.trim(),
      role,
      ...(password ? { password } : {}),
    };
    const request = id
      ? this.userService.updateUser(id, payload)
      : this.userService.createUser(payload);

    this.saving.set(true);
    this.error.set('');
    request.subscribe({
      next: () => this.router.navigate(['/users'], { replaceUrl: true }),
      error: (err: HttpErrorResponse) => {
        this.error.set(apiErrorMessage(err));
        this.saving.set(false);
      },
    });
  }

  private fillForm(user: User): void {
    // No cargamos la contraseña porque la API nunca la devuelve.
    this.form.patchValue({
      name: user.name,
      email: user.email,
      role: user.role,
    });
  }
}
