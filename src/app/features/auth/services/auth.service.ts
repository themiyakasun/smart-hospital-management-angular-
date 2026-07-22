import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { RegisterCredentialsModel } from '../models/register-credentials.model';
import { RegisterResponseModel } from '../models/register-response.model';

@Service()
export class AuthService {
  private http = inject(HttpClient);

  registerUser(payload: RegisterCredentialsModel) {
    return this.http
      .post<RegisterResponseModel>('/api/auth/register', payload)
      .subscribe((data) => {
        console.log('Register Success: ', data);
      });
  }
}
