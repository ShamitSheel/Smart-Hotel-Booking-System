import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Hotel, Room } from '../../../../core/models/hotel.model';
import { FormsModule } from '@angular/forms';
import { RoomFormComponent } from '../../../hotels/add-hotel/room-form/room-form'; // <-- New Import
 
@Component({
  selector: 'app-rooms-view',
  standalone: true,
  imports: [CommonModule, FormsModule, RoomFormComponent], // <-- Add to imports
  templateUrl: './rooms-view.html',
  styleUrls: ['./rooms-view.css']
})
 
export class RoomsViewComponent implements OnChanges {
  @Input() initialData!: Hotel;
  // The event will now emit the specific payload array for the backend
  @Output() dataUpdated = new EventEmitter<any[]>();
 
  isEditing = false;
  rooms: Room[] = [];
 
  // --- NEW: Keep track of rooms marked for deletion ---
  private deletedRooms: Room[] = [];
 
  showRoomForm = false;
  roomToEdit: Room | null = null;
 
  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialData'] && changes['initialData'].currentValue) {
      this.rooms = this.initialData.rooms.map(room => ({ ...room }));
      // Reset deleted rooms when initial data changes
      this.deletedRooms = [];
    }
  }
 
  onEdit(): void {
    this.isEditing = true;
  }
 
  onCancel(): void {
    this.isEditing = false;
    // Restore original state
    this.rooms = this.initialData.rooms.map(room => ({ ...room }));
    this.deletedRooms = [];
  }
 
  // --- MODIFIED: This is where we figure out the status for each room ---
  onSave(): void {
    const payload = [];
 
    // 1. Determine CREATE and UPDATE statuses
    for (const room of this.rooms) {
      if (room.id) { // If it has an ID, it's an existing room
        payload.push({ ...room, status: 'UPDATE' });
      } else { // No ID means it's a new room
        payload.push({ ...room, status: 'CREATE' });
      }
    }
 
    // 2. Add DELETE statuses
    for (const deletedRoom of this.deletedRooms) {
      payload.push({ ...deletedRoom, status: 'DELETE' });
    }
   
    // 3. Emit the final payload
    this.dataUpdated.emit(payload);
    this.isEditing = false;
  }
 
  onAddRoom(): void {
    this.roomToEdit = null;
    this.showRoomForm = true;
  }
 
  onEditRoom(room: Room): void {
    this.roomToEdit = room;
    this.showRoomForm = true;
  }
 
  // --- MODIFIED: Track rooms to delete instead of just removing them ---
  onDeleteRoom(index: number): void {
    const roomToDelete = this.rooms[index];
    // If the room has an ID, it exists in the database and needs to be marked for deletion
    if (roomToDelete.id) {
      this.deletedRooms.push(roomToDelete);
    }
    // Remove it from the visible list
    this.rooms.splice(index, 1);
  }
 
  onRoomFormSubmitted(room: Room): void {
    // This logic correctly handles adding/editing within the component's state
    if (this.roomToEdit && this.roomToEdit.id) {
      const index = this.rooms.findIndex(r => r.id === this.roomToEdit!.id);
      if (index !== -1) {
        this.rooms[index] = room;
      }
    } else {
      this.rooms.push(room);
    }
    this.showRoomForm = false;
    this.roomToEdit = null;
  }
 
  onRoomFormCanceled(): void {
    this.showRoomForm = false;
  }
}