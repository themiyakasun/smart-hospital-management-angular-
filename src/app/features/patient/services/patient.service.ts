import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { PatientModel } from '../models/patient.model';
import { PatientPayloadModel } from '../models/patient-payload.model';
import { tap } from 'rxjs';

@Service()
export class PatientService {
  private http = inject(HttpClient);
  patients = signal<PatientModel[]>([]);

  getPatients(departmentId?: string, search?: string, status?: string): void {
    const queryParts: string[] = [];
    if (departmentId) queryParts.push(`departmentId=${encodeURIComponent(departmentId)}`);
    if (search) queryParts.push(`search=${encodeURIComponent(search)}`);
    if (status) queryParts.push(`status=${encodeURIComponent(status)}`);

    const url = queryParts.length > 0 ? `/api/patients?${queryParts.join('&')}` : '/api/patients';

    this.http.get<PatientModel[]>(url).subscribe({
      next: (data) => this.patients.set(data),
      error: (error) => console.error('Failed to load patients', error),
    });
  }

  getPatientById(id: string) {
    return this.http.get<PatientModel>(`/api/patients/${id}`);
  }

  createPatient(payload: PatientPayloadModel) {
    return this.http.post<PatientModel>('/api/patients', payload).pipe(
      tap((newPatient) => {
        this.patients.update((prev) => [...prev, newPatient]);
      }),
    );
  }

  updatePatient(payload: PatientPayloadModel, id: string) {
    return this.http.put<PatientModel>(`/api/patients/${id}`, payload);
  }

  deletePatient(id: string) {
    return this.http.delete<{ message: string }>(`/api/patients/${id}`).pipe(
      tap(() => {
        this.patients.update((prev) => prev.filter((patient) => patient.id !== id));
      }),
    );
  }
}
