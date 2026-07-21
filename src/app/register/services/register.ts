import { HttpClient } from '@angular/common/http';
import { inject, Service } from '@angular/core';
import { User, UserResponse } from '../models/user';

@Service()
export class RegisterService {
  private http = inject(HttpClient);

  registerUser(payload: User) {
    return this.http.post<UserResponse>('/api/auth/register', payload).subscribe((data) => {
      console.log('Register Success: ', data);
    });
  }
}
