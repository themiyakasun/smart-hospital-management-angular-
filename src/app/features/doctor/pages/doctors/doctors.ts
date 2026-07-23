import { Component, inject, OnInit } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { DoctorService } from '../../services/doctor.service';
import { DoctorCard } from '../../components/doctor-card/doctor-card';
import { MatDialog } from '@angular/material/dialog';
import { DoctorForm } from '../../components/doctor-form/doctor-form';
import { DoctorFilter } from '../../components/doctor-filter/doctor-filter';

@Component({
  selector: 'app-doctors',
  imports: [
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatSelectModule,
    MatFormFieldModule,
    DoctorCard,
    DoctorFilter,
  ],
  templateUrl: './doctors.html',
  styleUrl: './doctors.css',
})
export class Doctors implements OnInit {
  doctorService = inject(DoctorService);
  doctorsList = this.doctorService.doctors;
  dialog = inject(MatDialog);

  ngOnInit(): void {
    this.doctorService.getDoctors();
  }

  openCreateForm() {
    this.dialog.open(DoctorForm, {
      width: '750px',
      maxWidth: '95vw',
      disableClose: true,
    });
  }

  onFilterChange(filter: { departmentId: string; search: string }) {
    this.doctorService.getDoctors(filter.departmentId, filter.search);
  }
}
