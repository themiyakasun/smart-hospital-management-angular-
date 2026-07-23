import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DepartmentService } from '../../services/department.service';

@Component({
  selector: 'app-department-form',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './department-form.html',
  styleUrl: './department-form.css',
})
export class DepartmentForm {
  private formBuilder = inject(FormBuilder);
  private departmentService = inject(DepartmentService);
  private dialogRef = inject(MatDialogRef<DepartmentForm>);

  departmentForm: FormGroup = this.formBuilder.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
  });

  submit() {
    if (this.departmentForm.invalid) return;

    this.departmentService.createDepartment(this.departmentForm.value).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Failed to create department', error);
      },
    });
  }
}
