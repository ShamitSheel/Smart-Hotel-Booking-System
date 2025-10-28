import { CommonModule } from '@angular/common';
import { Component, inject, signal } from '@angular/core';
import { Hotel } from '../../../core/models/hotel.model';
import { HotelService } from '../../../core/services/hotel-service';
import { ActivatedRoute, Router } from '@angular/router';
import { switchMap, map, Observable, catchError, forkJoin, of } from 'rxjs'; 
import { HotelCardComponent } from '../hotel-search-cards/hotel-search-cards';
import { LocationService } from '../../../core/services/location-service'; // Import location service if you need it for autocomplete/suggestions
import { ReviewService } from '../../../core/services/review-service';

// Define the enriched hotel type for clarity
type EnrichedHotel = Hotel & { 
  // We'll update the existing 'rating' and 'reviews' fields on the Hotel model
  // but this type helps convey the final shape of the data.
};

@Component({
  selector: 'app-search-result-component',
  standalone: true,
  // Ensure all necessary imports are present
  imports: [CommonModule, HotelCardComponent], 
  templateUrl: './search-result-component.html',
  styleUrl: './search-result-component.css'
})

export class SearchResultComponent {
  private route = inject(ActivatedRoute);
  private hotelService = inject(HotelService);
  private reviewService = inject(ReviewService); // <-- INJECT ReviewService

  hotels = signal<EnrichedHotel[]>([]); // Use the enriched type
  searchQuery = ''; 

  constructor() {
    this.route.queryParams
      .pipe(
        // 1. Fetch Hotels
        switchMap(params => {
          const location = params['location'] as string | undefined;
          const type = params['type'] as string | undefined;
          
          let hotelObservable: Observable<Hotel[]>;
          
          if (location || type) {
            hotelObservable = this.hotelService.searchHotels(location || null, type || null);
            this.searchQuery = (location && type) ? `${location} (${type})` : location || type || 'Search Results';
          } 
          else if (params['hotelId']) {
            this.searchQuery = 'Hotel Details';
            hotelObservable = this.hotelService.getHotelById(params['hotelId']).pipe(
              map(hotel => hotel ? [hotel] : [])
            );
          } 
          else {
            this.searchQuery = 'All Hotels';
            hotelObservable = this.hotelService.getAllHotels();
          }
          
          return hotelObservable;
        }),
        
        // 2. Enrich Data with Rating/Review Count
        switchMap(hotels => {
          if (!hotels || hotels.length === 0) {
            return of([]); // If no hotels, return empty list immediately
          }

          // Create an array of observables, one for each hotel's rating call
          const ratingObservables = hotels.map(hotel => 
            this.reviewService.getAverageRatingAndCount(hotel.id)
              .pipe(
                // Map the rating response back into the original hotel object
                map(ratingData => ({
                  ...hotel,
                  rating: ratingData.averageRating,
                  reviews: ratingData.reviewCount,
                }) as EnrichedHotel), // Ensure type safety
                // On error (e.g., review service down), return hotel with default values
                catchError(() => of({ ...hotel, rating: 0, reviews: 0 } as EnrichedHotel)) 
              )
          );

          // Use forkJoin to wait for all the rating observables to complete
          return forkJoin(ratingObservables);
        })
      )
      .subscribe(
        (data: EnrichedHotel[]) => { // Data now contains the final, enriched list
          this.hotels.set(data);
          console.log('Search results enriched with ratings:', data); 
        },
        (err) => {
          console.error('Error fetching data (Hotels or Reviews):', err);
          this.hotels.set([]); 
        }
      );
  }
}

