import { Component, inject, OnInit, signal } from '@angular/core';
import { FormGroup, NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-login',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatCheckboxModule,
  ],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  isLoading = signal(false);
  formBuilder = inject(NonNullableFormBuilder);
  authService = inject(AuthService);
  notificationService = inject(NotificationService);

  ngOnInit(): void {
    this.loginForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
    });
  }

  login() {
    if (this.loginForm.invalid) return;

    this.isLoading.set(true);

    this.authService.loginUser(this.loginForm.value).subscribe({
      next: (response) => {
        this.isLoading.set(false);

        this.notificationService.showSuccess('Logged to account successfully!');
        this.loginForm.reset();
      },
      error: (error) => {
        this.isLoading.set(false);
        console.error('Loggin failed, interceptor will show the UI message.');
      },
    });
  }
}
