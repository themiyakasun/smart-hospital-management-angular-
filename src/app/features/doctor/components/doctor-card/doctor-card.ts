import { Component, input, output } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-doctor-card',
  imports: [MatIconModule, MatButtonModule, MatCardModule],
  templateUrl: './doctor-card.html',
  styleUrl: './doctor-card.css',
})
export class DoctorCard {
  firstName = input.required<string>();
  lastName = input.required<string>();
  departmentName = input.required<string>();
  specialization = input.required<string>();
  availability = input.required<{ day: string; startTime: string; endTime: string }[]>();
  email = input.required<string>();
  phone = input.required<string>();

  deletedClick = output<void>();

  delete(event: Event) {
    event.stopPropagation();
    this.deletedClick.emit();
  }
}
