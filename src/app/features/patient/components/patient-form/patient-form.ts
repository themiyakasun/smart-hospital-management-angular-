import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { DoctorService } from '../../../doctor/services/doctor.service';
import { DepartmentService } from '../../../departments/services/department.service';
import { PatientService } from '../../services/patient.service';

@Component({
  selector: 'app-patient-form',
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './patient-form.html',
  styleUrl: './patient-form.css',
})
export class PatientForm implements OnInit {
  private formBuilder = inject(FormBuilder);
  patientService = inject(PatientService);
  doctorService = inject(DoctorService);
  departmentService = inject(DepartmentService);
  doctors = this.doctorService.doctors;
  departments = this.departmentService.departments;

  private dialogRef = inject(MatDialogRef<PatientForm>);

  ngOnInit(): void {
    if (this.departments().length === 0) {
      this.departmentService.getDepartments();
    }

    if (this.doctors().length === 0) {
      this.doctorService.getDoctors();
    }
  }

  genders = ['Male', 'Female', 'Other'];
  bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

  patientForm: FormGroup = this.formBuilder.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    phone: ['', Validators.required],
    age: ['', Validators.required],
    gender: ['', Validators.required],
    bloodGroup: ['', Validators.required],
    address: ['', Validators.required],
    departmentId: ['', Validators.required],
    assignedDoctorId: ['', Validators.required],
  });

  submit() {
    if (this.patientForm.invalid) return;

    this.patientService.createPatient(this.patientForm.value).subscribe({
      next: (response) => this.dialogRef.close(true),
      error: (error) => console.error('Failed to create patient', error),
    });
  }
}
