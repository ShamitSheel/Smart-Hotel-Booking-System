import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../../core/services/auth-service';
import { BookingService } from '../../../core/services/booking-service';
import { ReviewService } from '../../../core/services/review-service';
import { Booking } from '../../../core/models/booking.models';
import { Hotel, Room } from '../../../core/models/hotel.model';
import { Review, ReviewRequest } from '../../../core/models/review.models';
import { forkJoin, of } from 'rxjs';
import { switchMap, map, catchError } from 'rxjs/operators';

interface EnrichedBooking extends Booking {
  hotelName?: string;
  roomName?: string;
  roomImage?: string;
  hasReviewed?: boolean;
}

@Component({
  selector: 'app-my-bookings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './my-booking.html',
  styleUrls: ['./my-booking.css']
})
export class MyBooking implements OnInit {
  currentBookings: EnrichedBooking[] = [];
  previousBookings: EnrichedBooking[] = [];
  isLoading: boolean = true;
  errorMessage: string = '';
  private currentUserId: string | null = null;
  private currentUserName: string | null = null;
  selectedTab: 'current' | 'previous' = 'current';

  showReviewForm: boolean = false;
  selectedBookingForReview: EnrichedBooking | null = null;
  reviewForm = {
    rating: 0,
    comment: ''
  };
  reviewSubmittedMessage: string = '';
  isSubmittingReview: boolean = false;

  constructor(
    private authService: AuthService,
    private bookingService: BookingService,
    private reviewService: ReviewService,
    private http: HttpClient,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.authService.currentUser$.pipe(
      switchMap(user => {
        if (user && user.id) {
          this.currentUserId = user.id;
          this.currentUserName = `${user.firstName} ${user.lastName}`.trim() || user.username;
          return this.bookingService.getMyBookings();
        } else {
          this.router.navigate(['/login']);
          return of([]);
        }
      }),
      switchMap(bookings => {
        if (bookings.length === 0) {
          this.isLoading = false;
          return of([]);
        }

        const enrichedBookingsObservables = bookings.map(booking => {
          const hotelUrl = `https://hotelify-api-gateway.onrender.com/api/hotels/${booking.hotelId}`;

          return forkJoin([
            this.http.get<Hotel>(hotelUrl).pipe(
              catchError(err => {
                console.error('Error fetching hotel data', err);
                return of(null);
              })
            ),
            this.reviewService.getReviewsByHotelId(booking.hotelId).pipe(
              catchError(err => {
                console.error('Error fetching reviews', err);
                return of([]);
              })
            )
          ]).pipe(
            map(([hotel, reviews]) => {
              const room = hotel?.rooms.find(r => r.id === booking.roomId);
              const hasReviewed = reviews.some(review => 
                review.userId === booking.userId && review.bookingId === booking.id
              );
              return {
                ...booking,
                hotelName: hotel ? hotel.name : 'Unknown Hotel',
                roomName: room ? room.name : 'Unknown Room',
                roomImage: room && room.images && room.images.length > 0 ? room.images[0] : 'https://placehold.co/400x300/E0E0E0/6C757D?text=No+Image',
                hasReviewed: hasReviewed
              } as EnrichedBooking;
            })
          );
        });
        return forkJoin(enrichedBookingsObservables);
      }),
      catchError(err => {
        this.isLoading = false;
        this.errorMessage = 'You dont have any upcoming bookings yet. Ready to plan your next trip?';
        console.error('Error loading bookings:', err);
        return of([]);
      })
    ).subscribe(enrichedBookings => {
      this.categorizeBookings(enrichedBookings);
      this.isLoading = false;
    });
  }

  private categorizeBookings(bookings: EnrichedBooking[]): void {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    this.currentBookings = [];
    this.previousBookings = [];

    bookings.forEach(booking => {
      const checkOutDate = new Date(booking.checkOutDate);
      checkOutDate.setHours(0, 0, 0, 0);

      if (checkOutDate >= currentDate) {
        this.currentBookings.push(booking);
      } else {
        this.previousBookings.push(booking);
      }
    });

    this.currentBookings.sort((a, b) => new Date(a.checkInDate).getTime() - new Date(b.checkInDate).getTime());
    this.previousBookings.sort((a, b) => new Date(b.checkOutDate).getTime() - new Date(a.checkOutDate).getTime());
  }

  selectTab(tab: 'current' | 'previous'): void {
    this.selectedTab = tab;
  }

  openReviewForm(booking: EnrichedBooking): void {
    this.selectedBookingForReview = booking;
    this.showReviewForm = true;
    this.reviewSubmittedMessage = '';
    this.reviewForm.rating = 0;
    this.reviewForm.comment = '';
  }

  closeReviewForm(): void {
    this.showReviewForm = false;
    this.selectedBookingForReview = null;
    this.isSubmittingReview = false;
  }

  submitReview(form: NgForm): void {
    if (form.invalid || !this.selectedBookingForReview || this.reviewForm.rating === 0) {
      alert('Please fill out all required fields and select a rating.');
      return;
    }

    this.isSubmittingReview = true;

    const reviewRequest: ReviewRequest = {
      hotelId: this.selectedBookingForReview.hotelId,
      bookingId: this.selectedBookingForReview.id,
      rating: this.reviewForm.rating,
      comment: this.reviewForm.comment,
      reviewerName: this.currentUserName || 'Anonymous'
    };

    this.reviewService.submitReview(reviewRequest).subscribe({
      next: (response) => {
        console.log('Review submitted successfully', response);
        this.selectedBookingForReview!.hasReviewed = true;
        this.reviewSubmittedMessage = 'Thank you for your review!';
        this.isSubmittingReview = false;
        setTimeout(() => {
          this.closeReviewForm();
        }, 2000);
      },
      error: (error) => {
        console.error('Failed to submit review', error);
        this.isSubmittingReview = false;
        if (error.status === 400) {
          this.reviewSubmittedMessage = 'You have already reviewed this booking or validation failed.';
        } else if (error.status === 401) {
          this.reviewSubmittedMessage = 'You are not authorized to submit this review.';
        } else {
          this.reviewSubmittedMessage = 'Failed to submit review. Please try again.';
        }
      }
    });
  }

  getStatusBadgeClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'CONFIRMED': return 'badge bg-success';
      case 'PENDING': return 'badge bg-warning text-dark';
      case 'CANCELLED': return 'badge bg-danger';
      default: return 'badge bg-secondary';
    }
  }

  getPaymentMethodDisplay(method: string): string {
    switch (method) {
      case 'PAY_AT_PROPERTY': return 'Pay at Property';
      case 'UPI': return 'UPI';
      case 'CARD': return 'Card';
      default: return method;
    }
  }
}
