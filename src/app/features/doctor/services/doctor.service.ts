import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { DoctorModel } from '../models/doctor.model';
import { DoctorPayloadModel } from '../models/doctor-payload.model';
import { tap } from 'rxjs';

@Service()
export class DoctorService {
  private http = inject(HttpClient);
  doctors = signal<DoctorModel[]>([]);

  getDoctors(): void {
    this.http.get<DoctorModel[]>('/api/doctors').subscribe({
      next: (data) => this.doctors.set(data),
      error: (error) => console.error('Faied to load doctors', error),
    });
  }

  getDoctorById(id: string) {
    return this.http.get<DoctorModel>(`/api/doctors/${id}`);
  }

  createDoctor(payload: DoctorPayloadModel) {
    return this.http.post<DoctorModel>('/api/doctors', payload).pipe(
      tap((newDoct) => {
        this.doctors.update((prev) => [...prev, newDoct]);
      }),
    );
  }

  updateDoctor({ payload, id }: { payload: DoctorPayloadModel; id: string }) {
    return this.http.put<DoctorModel>(`/api/doctors/${id}`, payload);
  }

  deleteDoctor(id: string) {
    return this.http.delete<{ message: string }>(`/api/doctors/${id}`).pipe(
      tap(() => {
        this.doctors.update((prev) => prev.filter((doctor) => doctor.id !== id));
      }),
    );
  }
}
