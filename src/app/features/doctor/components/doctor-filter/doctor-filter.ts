import { Component, inject, OnInit, output, signal } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { DepartmentService } from '../../../departments/services/department.service';

@Component({
  selector: 'app-doctor-filter',
  imports: [MatSelectModule, MatIconModule],
  templateUrl: './doctor-filter.html',
  styleUrl: './doctor-filter.css',
})
export class DoctorFilter implements OnInit {
  departmentService = inject(DepartmentService);
  departments = this.departmentService.departments;

  selectedDepartment = signal<string>('');
  searchQuery = signal<string>('');

  ngOnInit(): void {
    this.departmentService.getDepartments();
  }

  filterChange = output<{ departmentId: string; search: string }>();

  onDepartmentChange(event: MatSelectChange) {
    this.selectedDepartment.set(event.value);
    this.emitFilter();
  }

  onSearchInput(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchQuery.set(input.value);
    this.emitFilter();
  }

  private emitFilter() {
    this.filterChange.emit({
      departmentId: this.selectedDepartment(),
      search: this.searchQuery(),
    });
  }
}
