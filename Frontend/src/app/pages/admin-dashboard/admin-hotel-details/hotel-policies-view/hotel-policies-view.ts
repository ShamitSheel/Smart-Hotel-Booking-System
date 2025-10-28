import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Hotel, HotelPolicies } from '../../../../core/models/hotel.model';

@Component({
  selector: 'app-hotel-policies-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './hotel-policies-view.html',
  styleUrls: ['./hotel-policies-view.css']
})
export class HotelPoliciesViewComponent implements OnChanges {
  @Input() initialData!: Hotel;
  @Output() dataUpdated = new EventEmitter<Partial<Hotel>>();

  isEditing = false;
  
  // Properties that are top-level on the Hotel interface
  isFullyRefundable!: boolean;
  hasFreeBreakfast!: boolean;
  reserveNowPayLater!: boolean;

  // Properties nested within the policies object
  checkInTime!: string;
  checkOutTime!: string;
  cancellationPolicy!: string;
  smokingAllowed!: boolean;
  petsAllowed!: boolean;

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialData'] && changes['initialData'].currentValue) {
      // Initialize top-level properties
      this.isFullyRefundable = this.initialData.isFullyRefundable;
      this.hasFreeBreakfast = this.initialData.hasFreeBreakfast;
      this.reserveNowPayLater = this.initialData.reserveNowPayLater;

      // Initialize nested policy properties
      this.checkInTime = this.initialData.policies.checkInTime;
      this.checkOutTime = this.initialData.policies.checkOutTime;
      this.cancellationPolicy = this.initialData.policies.cancellationPolicy;
      this.smokingAllowed = this.initialData.policies.smokingAllowed;
      this.petsAllowed = this.initialData.policies.petsAllowed;
    }
  }

  onEdit(): void {
    this.isEditing = true;
  }

  onCancel(): void {
    this.isEditing = false;
    // Revert all properties
    this.isFullyRefundable = this.initialData.isFullyRefundable;
    this.hasFreeBreakfast = this.initialData.hasFreeBreakfast;
    this.reserveNowPayLater = this.initialData.reserveNowPayLater;
    this.checkInTime = this.initialData.policies.checkInTime;
    this.checkOutTime = this.initialData.policies.checkOutTime;
    this.cancellationPolicy = this.initialData.policies.cancellationPolicy;
    this.smokingAllowed = this.initialData.policies.smokingAllowed;
    this.petsAllowed = this.initialData.policies.petsAllowed;
  }

  onSave(): void {
    const updatedPolicies: HotelPolicies = {
      checkInTime: this.checkInTime,
      checkOutTime: this.checkOutTime,
      cancellationPolicy: this.cancellationPolicy,
      smokingAllowed: this.smokingAllowed,
      petsAllowed: this.petsAllowed,
    };
    
    const updatedData: Partial<Hotel> = {
      isFullyRefundable: this.isFullyRefundable,
      hasFreeBreakfast: this.hasFreeBreakfast,
      reserveNowPayLater: this.reserveNowPayLater,
      policies: updatedPolicies
    };
    
    this.dataUpdated.emit(updatedData);
    this.isEditing = false;
  }
}