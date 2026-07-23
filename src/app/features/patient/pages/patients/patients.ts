import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { PatientService } from '../../services/patient.service';
import { PatientTable } from '../../components/patient-table/patient-table';
import { PatientForm } from '../../components/patient-form/patient-form';
import { MatDialog } from '@angular/material/dialog';
import { NotificationService } from '../../../../core/services/notification.service';

@Component({
  selector: 'app-patients',
  imports: [MatIconModule, MatButtonModule, MatSelectModule, MatFormFieldModule, PatientTable],
  templateUrl: './patients.html',
  styleUrl: './patients.css',
})
export class Patients implements OnInit {
  patientService = inject(PatientService);
  notificationService = inject(NotificationService);
  patients = this.patientService.patients;
  dialog = inject(MatDialog);

  ngOnInit(): void {
    this.patientService.getPatients();
  }

  openCreateForm() {
    this.dialog.open(PatientForm, {
      width: '750px',
      maxWidth: '95vw',
      disableClose: true,
    });
  }

  delete(id: string) {
    this.patientService.deletePatient(id).subscribe({
      next: (response) => {
        this.notificationService.showSuccess('Patient deleted successfully');
      },
      error: (error) => console.error('Failed to delete patient', error),
    });
  }
}
