import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Hotel } from '../../../../core/models/hotel.model';

@Component({
  selector: 'app-review-submit',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './review-submit.html',
  styleUrls: ['./review-submit.css']
})
export class ReviewSubmit {
  @Input() hotelData: Partial<Hotel> = {};
  @Output() formSubmitted = new EventEmitter<Partial<Hotel>>();
  @Output() goBack = new EventEmitter<void>();

  // A helper method to display a comma-separated list of amenities
  get amenitiesList(): string {
    return this.hotelData.amenities?.join(', ') || 'None';
  }

  // A helper method to display a comma-separated list of features
  get featuresList(): string {
    return this.hotelData.features?.join(', ') || 'None';
  }

  onSubmit(): void {
    this.formSubmitted.emit(this.hotelData);
  }

  onGoBack(): void {
    this.goBack.emit();
  }
}
