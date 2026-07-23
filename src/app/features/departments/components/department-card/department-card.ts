import { Component, input, output } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-department-card',
  standalone: true,
  imports: [MatCardModule, MatIconModule],
  templateUrl: './department-card.html',
  styleUrl: './department-card.css',
})
export class DepartmentCard {
  name = input.required<string>();
  description = input<string>();
  iconName = input<string>('analytics');
  iconColor = input<string>('#0052cc');

  deleteClicked = output<void>();

  delete(event: Event) {
    event.stopPropagation();
    this.deleteClicked.emit();
  }
}
