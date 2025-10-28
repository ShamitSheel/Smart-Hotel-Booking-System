import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { HotelListingService } from '../../../core/services/hotel-listing-service';
import { AuthService } from '../../../core/services/auth-service';
import { Hotel } from '../../../core/models/hotel.model';
import { BehaviorSubject, catchError, forkJoin, map, Observable, of, Subscription, switchMap } from 'rxjs';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ConfirmationModalComponent } from '../../../shared/confirmation-modal/confirmation-modal';
import { ReviewService } from '../../../core/services/review-service';

@Component({
  selector: 'app-admin-hotel-list',
  standalone: true,
  imports: [
    CommonModule, 
    RouterModule, 
    MatProgressSpinnerModule,
    ConfirmationModalComponent
  ],
  templateUrl: './admin-hotel-list.html',
  styleUrls: ['./admin-hotel-list.css']
})

export class AdminHotelListComponent implements OnInit, OnDestroy {
  private _hotelsSubject = new BehaviorSubject<Hotel[]>([]);
  hotels$: Observable<Hotel[]> = this._hotelsSubject.asObservable();
  isLoading = true;
  private authSubscription!: Subscription;
  
  showConfirmationModal = false;
  hotelToDeleteId: string | null = null;
  deleteWarningText = '';

  constructor(
    private hotelListingService: HotelListingService,
    private authService: AuthService,
    private router: Router,
    private reviewService: ReviewService // <-- 1. INJECT your ReviewService
  ) { }

  ngOnInit(): void {
    this.authSubscription = this.authService.currentUser$.subscribe(user => {
      if (user && user.id) {
        this.loadHotelsAndRatings(user.id);
      } else {
        this.isLoading = false;
        this._hotelsSubject.next([]);
        console.warn('No logged-in user found.');
      }
    });
  }

  ngOnDestroy(): void {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  loadHotelsAndRatings(managerId: string): void {
    this.isLoading = true;
    this.hotelListingService.getHotelsByManagerId(managerId).pipe(
      switchMap(hotels => {
        if (hotels.length === 0) {
          return of([]);
        }
        
        // --- 2. CALL the method from your ReviewService ---
        const ratingObservables = hotels.map(hotel => 
          this.reviewService.getAverageRatingAndCount(hotel.id).pipe( // <-- Use getAverageRatingAndCount
            catchError(() => of({ hotelId: hotel.id, averageRating: 0, reviewCount: 0 }))
          )
        );
        
        return forkJoin(ratingObservables).pipe(
          map(ratings => {
            const ratingMap = new Map(ratings.map(r => [r.hotelId, r.averageRating]));
            return hotels.map(hotel => ({
              ...hotel,
              rating: ratingMap.get(hotel.id) ?? 0
            }));
          })
        );
      })
    ).subscribe({
      next: (hotelsWithRatings) => {
        this._hotelsSubject.next(hotelsWithRatings);
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load hotels and ratings', err);
        this.isLoading = false;
        alert('Could not load hotel data.');
      }
    });
  }

  onViewDetails(hotelId: string): void {
    this.router.navigate(['/admin/hotels', hotelId]);
  }

  onDeleteHotel(hotelId: string): void {
    this.hotelToDeleteId = hotelId;
    this.deleteWarningText = `You are about to permanently delete this hotel and all related data, including bookings, reviews, and rooms. This action cannot be undone.`;
    this.showConfirmationModal = true;
  }

  onConfirmDeletion(confirmed: boolean): void {
    if (confirmed && this.hotelToDeleteId) {
      this.hotelListingService.deleteHotel(this.hotelToDeleteId).subscribe({
        next: () => {
          console.log('Hotel deleted successfully.');
          alert('Hotel deleted successfully!');
          const currentUser = this.authService.getCurrentUser();
          if (currentUser) {
            this.loadHotelsAndRatings(currentUser.id);
          }
        },
        error: (err) => {
          console.error('Failed to delete hotel:', err);
          alert('Failed to delete hotel.');
        }
      });
    }
    this.showConfirmationModal = false;
    this.hotelToDeleteId = null;
    this.deleteWarningText = '';
  }
}