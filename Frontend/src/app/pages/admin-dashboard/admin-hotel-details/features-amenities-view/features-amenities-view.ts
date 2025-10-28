import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Hotel } from '../../../../core/models/hotel.model';

@Component({
  selector: 'app-features-amenities-view',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './features-amenities-view.html',
  styleUrls: ['./features-amenities-view.css']
})
export class FeaturesAmenitiesViewComponent implements OnChanges {
  @Input() initialData!: Hotel;
  @Output() dataUpdated = new EventEmitter<Partial<Hotel>>();
  
  isEditing = false;
  newFeature = '';
  newAmenity = '';
  
  features: string[] = [];
  amenities: string[] = [];

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['initialData'] && changes['initialData'].currentValue) {
      this.features = [...this.initialData.features];
      this.amenities = [...this.initialData.amenities];
    }
  }
  
  onEdit(): void {
    this.isEditing = true;
  }

  onCancel(): void {
    this.isEditing = false;
    this.features = [...this.initialData.features];
    this.amenities = [...this.initialData.amenities];
    this.newFeature = '';
    this.newAmenity = '';
  }

  onSave(): void {
    const updatedData = {
      features: this.features,
      amenities: this.amenities,
    };
    this.dataUpdated.emit(updatedData);
    this.isEditing = false;
  }
  
  // Features Logic
  addFeature(): void {
    if (this.newFeature.trim() !== '') {
      this.features.push(this.newFeature.trim());
      this.newFeature = '';
    }
  }
  
  deleteFeature(index: number): void {
    this.features.splice(index, 1);
  }

  // Amenities Logic
  addAmenity(): void {
    if (this.newAmenity.trim() !== '') {
      this.amenities.push(this.newAmenity.trim());
      this.newAmenity = '';
    }
  }

  deleteAmenity(index: number): void {
    this.amenities.splice(index, 1);
  }
}