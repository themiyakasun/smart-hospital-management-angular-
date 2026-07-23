import { Component, inject, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { DepartmentCard } from '../../components/department-card/department-card';
import { DepartmentService } from '../../services/department.service';
import { DepartmentModel } from '../../models/department.model';
import { MatDialog } from '@angular/material/dialog';
import { DepartmentForm } from '../../components/department-form/department-form';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-departments',
  imports: [
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatSelectModule,
    MatFormFieldModule,
    DepartmentCard,
  ],
  templateUrl: './departments.html',
  styleUrl: './departments.css',
})
export class Departments implements OnInit {
  departmentService = inject(DepartmentService);
  notificationService = inject(NotificationService);
  departmentList = this.departmentService.departments;
  dialog = inject(MatDialog);

  ngOnInit(): void {
    this.departmentService.getDepartments();
  }

  openCreateForm() {
    this.dialog.open(DepartmentForm, {
      width: '500px',
      disableClose: true,
    });
  }

  delete(id: string) {
    this.departmentService.deleteDepartment(id).subscribe({
      next: (response) => {
        this.notificationService.showSuccess('Department deleted successfully');
      },
      error: (error) => {
        console.error('Failed to delete department', error);
      },
    });
  }
}
