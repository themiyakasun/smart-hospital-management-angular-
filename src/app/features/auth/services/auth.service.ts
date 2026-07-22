import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { RegisterCredentialsModel } from '../models/register-credentials.model';
import { RegisterResponseModel } from '../models/register-response.model';
import { LoginCredentialsModel } from '../models/login-credentials.model';
import { LoginResponseModel } from '../models/login-response.model';
import { Router } from '@angular/router';
import { tap } from 'rxjs';

@Service()
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  isAuthenticated = signal<boolean>(this.hasValidToken());

  registerUser(payload: RegisterCredentialsModel) {
    return this.http.post<RegisterResponseModel>('/api/auth/register', payload);
  }

  loginUser(payload: LoginCredentialsModel) {
    return this.http.post<LoginResponseModel>('/api/auth/login', payload).pipe(
      tap((response) => {
        localStorage.setItem('access_token', response.accessToken);
        this.isAuthenticated.set(true);
      }),
    );
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;

    return !this.isTokenExpired(token);
  }

  private isTokenExpired(token: string): boolean {
    try {
      const payloadBase64 = token.split('.')[1];

      const decodedJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));

      const decodedPayload = JSON.parse(decodedJson);

      if (decodedPayload.exp) {
        const currentTime = Math.floor(Date.now() / 1000);
        return currentTime >= decodedPayload.exp;
      }

      return false;
    } catch (e) {
      console.error('Failed to decode JWT', e);
      return true;
    }
  }
}
