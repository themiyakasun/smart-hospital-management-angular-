import { DatePipe, SlicePipe } from '@angular/common';
import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { PatientModel } from '../../models/patient.model';

@Component({
  selector: 'app-patient-table',
  imports: [MatIconModule, MatButtonModule, DatePipe, SlicePipe],
  templateUrl: './patient-table.html',
  styleUrl: './patient-table.css',
})
export class PatientTable {
  patients = input.required<PatientModel[]>();

  deletedClick = output<string>();

  delete(event: Event, id: string) {
    event.stopPropagation();
    this.deletedClick.emit(id);
  }
}
