import { DatePipe, SlicePipe } from '@angular/common';
import { Component, inject, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PatientModel } from '../../models/patient.model';
import { MatDialog } from '@angular/material/dialog';
import { PatientForm } from '../patient-form/patient-form';

@Component({
  selector: 'app-patient-table',
  imports: [MatIconModule, MatButtonModule, DatePipe, SlicePipe],
  templateUrl: './patient-table.html',
  styleUrl: './patient-table.css',
})
export class PatientTable {
  patients = input.required<PatientModel[]>();
  dialog = inject(MatDialog);

  deletedClick = output<string>();

  delete(event: Event, id: string) {
    event.stopPropagation();
    this.deletedClick.emit(id);
  }

  openEditForm(patient: PatientModel) {
    this.dialog.open(PatientForm, {
      width: '750px',
      maxWidth: '95vw',
      disableClose: true,
      data: patient,
    });
  }
}
