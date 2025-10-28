// src/app/pages/hotels/add-hotel/room-details/room-details.component.ts

import { Component, EventEmitter, Input, Output, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Hotel, Room } from '../../../../core/models/hotel.model';

@Component({
  selector: 'app-room-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './room-details.html',
  styleUrls: ['./room-details.css']
})
export class RoomDetailsComponent implements OnInit, OnChanges { // <-- Implement OnChanges
  @Input() initialData: Partial<Hotel> = {};
  @Output() formSubmitted = new EventEmitter<Room[]>();
  @Output() goBack = new EventEmitter<void>();
  @Output() addRoom = new EventEmitter<void>();
  @Output() editRoom = new EventEmitter<Room>();
  @Output() deleteRoom = new EventEmitter<string>();

  rooms: Room[] = [];

  constructor() { }
  
  ngOnInit(): void {
    this.rooms = this.initialData.rooms || [];
  }
  
  // New lifecycle hook to handle input changes
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialData'] && changes['initialData'].currentValue) {
      this.rooms = changes['initialData'].currentValue.rooms || [];
    }
  }

  // Helper method to pass the room data to the parent
  onAddRoom(): void {
    this.addRoom.emit();
  }

  onEditRoom(room: Room): void {
    this.editRoom.emit(room);
  }

  // Corrected method: emits the room's ID to the parent
  onDeleteRoom(roomId: string): void {
    this.deleteRoom.emit(roomId);
  }

  onSubmit(): void {
    this.formSubmitted.emit(this.rooms);
  }

  onGoBack(): void {
    this.goBack.emit();
  }
}