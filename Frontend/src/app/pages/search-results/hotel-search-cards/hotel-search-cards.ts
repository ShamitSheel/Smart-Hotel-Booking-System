import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Hotel, Room } from '../../../core/models/hotel.model';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-hotel-search-cards',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './hotel-search-cards.html',
  styleUrl: './hotel-search-cards.css'
})
export class HotelCardComponent implements OnChanges {
  @Input() hotel!: Hotel;
  lowestPriceRoom: Room | null = null;

  // Map features to Bootstrap Icons
  featureIcons: { [key: string]: string } = {
    'Swimming Pool': 'bi-water',
    'Spa': 'bi-gem',
    'Gym': 'bi-heart-pulse',
    'Restaurant': 'bi-restaurant',
    'Dining': 'bi-cup-hot',
    'Beach Access': 'bi-sun',
    'Business Center': 'bi-briefcase'
  };

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['hotel'] && this.hotel && this.hotel.rooms) {
      this.lowestPriceRoom = this.getLowestPriceRoom();
    }
  }

  getLowestPriceRoom(): Room | null {
    if (!this.hotel || !this.hotel.rooms || this.hotel.rooms.length === 0) {
      return null;
    }
    return this.hotel.rooms.reduce((lowest, current) =>
      (current.discountedPrice < lowest.discountedPrice) ? current : lowest
    );
  }

  imageError(event: Event) {
    (event.target as HTMLImageElement).src = 'https://via.placeholder.com/320x320?text=Image+Not+Found';
  }

  // A getter for the rating description
  get ratingText(): string {
    if (this.hotel.rating === undefined || this.hotel.rating === null || this.hotel.rating <= 0) return 'No rating';
    if (this.hotel.rating >= 4.5) return 'Exceptional';
    if (this.hotel.rating >= 4.0) return 'Excellent';
    if (this.hotel.rating >= 3.0) return 'Good';
    if (this.hotel.rating >= 2.0) return 'Fair';
    return 'Poor';
  }


  // A getter to get the icon for a feature string
  getFeatureIcon(feature: string): string {
    return this.featureIcons[feature] || 'bi-info-circle';
  }
}

