import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';

import { AuthService } from '../../services/auth.service';
import { passwordMatchValidator } from '../../../../validators/password-match.validator';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-register',
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatCheckboxModule,
    MatSelectModule,
    MatOptionModule,
  ],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit {
  registerForm!: FormGroup;
  isLoading: boolean = false;

  private passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private notificationService: NotificationService,
  ) {}

  ngOnInit(): void {
    this.registerForm = this.formBuilder.group(
      {
        firstName: ['', [Validators.required]],
        lastName: ['', [Validators.required]],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.pattern(this.passwordRegex)]],
        confirmPassword: ['', [Validators.required]],
        role: ['', [Validators.required]],
      },
      { validators: passwordMatchValidator },
    );
  }

  register() {
    if (this.registerForm.invalid) return;

    this.isLoading = true;

    this.authService.registerUser(this.registerForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;

        this.notificationService.showSuccess('Account created successfully!');
        this.registerForm.reset();
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Registration failed, interceptor will show the UI message.');
      },
    });
  }
}
