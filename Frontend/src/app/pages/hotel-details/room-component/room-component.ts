import { Component, Input } from '@angular/core';
import { Room } from '../../../core/models/hotel.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
@Component({
  selector: 'app-room-component',
  imports: [CommonModule, FormsModule],
  templateUrl: './room-component.html',
  styleUrl: './room-component.css'
})
export class RoomComponent {
  @Input() room!: Room;
  @Input() hotelId!: string; 

  constructor(private router: Router) { }

    imageError(event: any): void {
    event.target.src = 'https://via.placeholder.com/400x300.png?text=Image+Not+Found';
  }

  reserveRoom(): void {
    if (this.room.isAvailable) {
      this.router.navigate(['/book-room', this.room.id, this.hotelId]);
    }
  }
}
