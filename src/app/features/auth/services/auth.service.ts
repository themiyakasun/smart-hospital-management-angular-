import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { RegisterCredentialsModel } from '../models/register-credentials.model';
import { RegisterResponseModel } from '../models/register-response.model';
import { LoginCredentialsModel } from '../models/login-credentials.model';
import { LoginResponseModel } from '../models/login-response.model';

@Service()
export class AuthService {
  private http = inject(HttpClient);

  registerUser(payload: RegisterCredentialsModel) {
    return this.http.post<RegisterResponseModel>('/api/auth/register', payload);
  }

  loginUser(payload: LoginCredentialsModel) {
    return this.http.post<LoginResponseModel>('/api/auth/login', payload);
  }
}
