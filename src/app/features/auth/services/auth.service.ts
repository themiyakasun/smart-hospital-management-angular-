import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { RegisterCredentialsModel } from '../models/register-credentials.model';
import { RegisterResponseModel } from '../models/register-response.model';
import { LoginCredentialsModel } from '../models/login-credentials.model';
import { LoginResponseModel } from '../models/login-response.model';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { RefreshResponseModel } from '../models/refresh-response.model';

@Service()
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  isAuthenticated = signal<boolean>(this.hasValidToken());
  userRole = signal<string | null>(this.getRoleFromToken());

  registerUser(payload: RegisterCredentialsModel) {
    return this.http.post<RegisterResponseModel>('/api/auth/register', payload);
  }

  loginUser(payload: LoginCredentialsModel) {
    return this.http.post<LoginResponseModel>('/api/auth/login', payload).pipe(
      tap((response) => {
        this.saveTokens(response.accessToken, response.refreshToken);
        this.isAuthenticated.set(true);
        this.userRole.set(this.getRoleFromToken());
      }),
    );
  }

  refreshToken(refreshToken: string) {
    return this.http.post<RefreshResponseModel>('/api/auth/refresh', { refreshToken }).pipe(
      tap((response) => {
        this.saveTokens(response.accessToken, response.refreshToken);
        this.userRole.set(this.getRoleFromToken());
      }),
    );
  }

  logout(refreshToken: string) {
    return this.http.post('/api/auth/logout', { refreshToken }).pipe(
      tap((response) => {
        this.removeTokens();
        this.router.navigate(['/login']);
        this.isAuthenticated.set(false);
        this.userRole.set(null);
      }),
    );
  }

  getToken(): string | null {
    return localStorage.getItem('access_token');
  }

  getRefreshToken(): string | null {
    return localStorage.getItem('refresh_token');
  }

  private saveTokens(accessToken: string, refreshToken: string) {
    localStorage.setItem('access_token', accessToken);
    localStorage.setItem('refresh_token', refreshToken);
  }

  private removeTokens() {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  hasValidToken(): boolean {
    const token = this.getToken();
    if (!token) return false;

    return !this.isTokenExpired(token);
  }

  private getRoleFromToken(): string | null {
    const token = this.getToken();

    if (!token) return null;

    try {
      const payloadBase64 = token.split('.')[1];
      const decodedJson = atob(payloadBase64.replace(/-/g, '+').replace(/_/g, '/'));
      const decodedPayload = JSON.parse(decodedJson);

      return decodedPayload.role || null;
    } catch (error) {
      return null;
    }
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
