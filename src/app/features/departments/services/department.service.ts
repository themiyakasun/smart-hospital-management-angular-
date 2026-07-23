import { HttpClient } from '@angular/common/http';
import { inject, Service, signal } from '@angular/core';
import { DepartmentModel } from '../models/department.model';
import { DepartmentPayloadModel } from '../models/department-payload.model';
import { tap } from 'rxjs';

@Service()
export class DepartmentService {
  private http = inject(HttpClient);
  departments = signal<DepartmentModel[]>([]);

  getDepartments(): void {
    this.http.get<DepartmentModel[]>('/api/departments').subscribe({
      next: (data) => this.departments.set(data),
      error: (error) => console.error('Failed to load departments', error),
    });
  }

  getDepartmentById(id: string) {
    return this.http.get<DepartmentModel>(`/api/departments/${id}`);
  }

  createDepartment(payload: DepartmentPayloadModel) {
    return this.http.post<DepartmentModel>('/api/departments', payload).pipe(
      tap((newDept) => {
        this.departments.update((prev) => [...prev, newDept]);
      }),
    );
  }

  updateDepartment({ payload, id }: { payload: DepartmentPayloadModel; id: string }) {
    return this.http.put<DepartmentModel>(`/api/departments/${id}`, payload);
  }

  deleteDepartment(id: string) {
    return this.http.delete<{ message: string }>(`/api/departments/${id}`).pipe(
      tap(() => {
        this.departments.update((prev) => prev.filter((department) => department.id !== id));
      }),
    );
  }
}
