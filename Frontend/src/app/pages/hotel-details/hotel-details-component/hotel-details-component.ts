// src/app/pages/hotel-details/hotel-details-component.ts
import { CommonModule } from '@angular/common';
import { Component, OnInit, signal, OnDestroy } from '@angular/core';
import { Hotel } from '../../../core/models/hotel.model';
import { ActivatedRoute } from '@angular/router';
import { HotelService } from '../../../core/services/hotel-service';
import { inject } from '@angular/core';
import { catchError, switchMap, takeUntil } from 'rxjs/operators';
import { Subject, of, forkJoin, map } from 'rxjs'; // Import forkJoin and map
import { RoomComponent } from '../room-component/room-component';
import { ReviewService } from '../../../core/services/review-service';
import { Review } from '../../../core/models/review.models';
 
@Component({
  selector: 'app-hotel-details-component',
  standalone: true,
  imports: [CommonModule, RoomComponent],
  templateUrl: './hotel-details-component.html',
  styleUrls: ['./hotel-details-component.css']
})
 
export class HotelDetailsComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private hotelService = inject(HotelService);
  private reviewService = inject(ReviewService);
  private destroy$ = new Subject<void>();
 
  hotel = signal<Hotel | undefined | null>(undefined); // Use null to indicate not found
  reviews = signal<Review[]>([]);
 
  ngOnInit(): void {
    this.route.paramMap
      .pipe(
        switchMap(params => {
          const hotelId = params.get('id');
          if (!hotelId) {
            this.hotel.set(null); // Set to null if no ID
            return of(null);
          }
 
          // Fetch hotel details, reviews, and rating info in parallel
          return forkJoin({
            hotel: this.hotelService.getHotelById(hotelId),
            reviews: this.reviewService.getReviewsByHotelId(hotelId),
            ratingInfo: this.reviewService.getAverageRatingAndCount(hotelId)
          }).pipe(
            catchError(err => {
              console.error('Error fetching hotel data:', err);
              this.hotel.set(null); // Set to null on error (e.g., 404 Not Found)
              return of(null);
            })
          );
        }),
        takeUntil(this.destroy$)
      )
      .subscribe(result => {
        if (result && result.hotel) {
          // Combine the data and update the signals
          const updatedHotel = {
            ...result.hotel,
            rating: result.ratingInfo.averageRating,
            reviews: result.ratingInfo.reviewCount
          };
          this.hotel.set(updatedHotel);
          // The ReviewResponseDTO already contains 'reviewerName', so no extra mapping is needed.
          this.reviews.set(result.reviews);
        }
      });
  }
 
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
 
  /**
   * UPDATED: Returns descriptive text based on a 5-star rating scale.
   */
  getRatingText(rating: number | undefined): string {
    if (rating === undefined || rating === null || rating <= 0) return 'No rating';
    if (rating >= 4.5) return 'Exceptional';
    if (rating >= 4.0) return 'Excellent';
    if (rating >= 3.0) return 'Good';
    if (rating >= 2.0) return 'Fair';
    return 'Poor';
  }
 
  /**
   * UPDATED: Returns a Bootstrap text color class based on a 5-star rating scale.
   */
  getRatingClass(rating: number | undefined): string {
    if (rating === undefined || rating === null || rating <= 0) return 'text-muted';
    if (rating >= 4.5) return 'text-success'; // Exceptional
    if (rating >= 4.0) return 'text-primary'; // Excellent
    if (rating >= 3.0) return 'text-info';    // Good
    if (rating >= 2.0) return 'text-warning'; // Fair
    return 'text-danger';                     // Poor
  }
}