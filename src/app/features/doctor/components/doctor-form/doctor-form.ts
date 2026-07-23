import { Component, inject } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DepartmentService } from '../../../departments/services/department.service';
import { DoctorService } from '../../services/doctor.service';

@Component({
  selector: 'app-doctor-form',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './doctor-form.html',
  styleUrl: './doctor-form.css',
})
export class DoctorForm {
  departmentService = inject(DepartmentService);
  doctorService = inject(DoctorService);
  departments = this.departmentService.departments;
  private formBuilder = inject(FormBuilder);
  private dialogRef = inject(MatDialogRef<DoctorForm>);

  daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  doctorForm: FormGroup = this.formBuilder.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    departmentId: ['', Validators.required],
    specialization: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', [Validators.required, Validators.pattern('^[0-9+ ]+$')]],
    availability: this.formBuilder.array([this.createAvailabilityGroup()]),
  });

  get availabilityControls() {
    return (this.doctorForm.get('availability') as FormArray).controls;
  }

  private createAvailabilityGroup(): FormGroup {
    return this.formBuilder.group({
      day: ['', Validators.required],
      startTime: ['', Validators.required],
      endTime: ['', Validators.required],
    });
  }

  addAvailability() {
    const availabilityArray = this.doctorForm.get('availability') as FormArray;
    availabilityArray.push(this.createAvailabilityGroup());
  }

  removeAvailability(index: number) {
    const availabilityArray = this.doctorForm.get('availability') as FormArray;
    if (availabilityArray.length > 1) {
      availabilityArray.removeAt(index);
    }
  }

  submit() {
    if (this.doctorForm.invalid) return;

    this.doctorService.createDoctor(this.doctorForm.value).subscribe({
      next: () => {
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Failed to create doctor', error);
      },
    });
  }
}
