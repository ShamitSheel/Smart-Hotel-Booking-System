import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BookingService } from '../../../core/services/booking-service';
import { HotelListingService } from '../../../core/services/hotel-listing-service';
import { AuthService } from '../../../core/services/auth-service';
import { ReviewService } from '../../../core/services/review-service'; // Import ReviewService
import { Booking, EnhancedBooking } from '../../../core/models/booking.models';
import { Hotel, Room } from '../../../core/models/hotel.model';
import { Review } from '../../../core/models/review.models';
import { BehaviorSubject, combineLatest, forkJoin, map, Observable, of, Subject, takeUntil, tap } from 'rxjs';

// Update the interface to include reviews
interface EnhancedBookingWithReviews extends EnhancedBooking {
  reviews?: Review[];
  averageRating?: number;
}

@Component({
  selector: 'app-admin-bookings',
  standalone: true,
  imports: [CommonModule, MatProgressSpinnerModule],
  templateUrl: './admin-bookings.html',
  styleUrls: ['./admin-bookings.css']
})

export class AdminBookingsComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private allBookingsSubject = new BehaviorSubject<EnhancedBookingWithReviews[]>([]);
  filteredBookings$: Observable<EnhancedBookingWithReviews[]> = this.allBookingsSubject.asObservable();

  isLoading = true;
  currentFilter: string = 'all'; // Default filter
  selectedHotelReviews: Review[] = [];
  showReviewModal: boolean = false;
  selectedHotelName: string = '';

  constructor(
    private bookingService: BookingService,
    private authService: AuthService,
    private reviewService: ReviewService
  ) { }

  ngOnInit(): void {
    this.loadBookings();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadBookings(): void {
    this.isLoading = true;
    const currentUser = this.authService.getCurrentUser();

    if (!currentUser) {
      console.error('Access Denied: User not logged in.');
      alert('You must be logged in to view bookings.');
      this.isLoading = false;
      return;
    }

    const managerId = currentUser.id;

    // The logic is now simplified to a single API call
    this.bookingService.getBookingsByManagerId(managerId).pipe(
      takeUntil(this.destroy$),
      // The backend returns most enhanced data, we just convert date strings to Date objects
      map(bookingsFromApi => {
        return bookingsFromApi.map(booking => ({
          ...booking,
          displayCheckInDate: new Date(booking.checkInDate),
          displayCheckOutDate: new Date(booking.checkOutDate),
          displayBookingDate: new Date(booking.bookingDate),
        }));
      }),
      // Tap into the stream to perform side effects
      tap(enhancedBookings => {
        this.allBookingsSubject.next(enhancedBookings);
        this.isLoading = false;
        this.applyFilter(this.currentFilter); // Apply the default filter once data is loaded
      })
    ).subscribe({
      error: (err) => {
        console.error('Error loading bookings:', err);
        this.isLoading = false;
        alert('Failed to load bookings.');
      }
    });
  }

  applyFilter(filterType: string): void {
    this.currentFilter = filterType;
    const today = new Date();
    this.normalizeDate(today);

    const bookings = this.allBookingsSubject.getValue();
    let filtered: EnhancedBookingWithReviews[] = [];

    switch (filterType) {
      case 'all':
        filtered = bookings;
        break;
      case 'current':
        filtered = bookings.filter(b =>
          b.displayCheckInDate.getTime() <= today.getTime() && b.displayCheckOutDate.getTime() >= today.getTime()
        );
        break;
      case 'upcoming':
        filtered = bookings.filter(b => b.displayCheckInDate.getTime() > today.getTime());
        break;
      case 'previous':
        filtered = bookings.filter(b => b.displayCheckOutDate.getTime() < today.getTime());
        break;
      case 'bookedToday':
        filtered = bookings.filter(b => this.isSameDay(b.displayBookingDate, today));
        break;
      case 'bookedThisWeek':
        const bookedStartOfWeek = this.getStartOfWeek(today);
        const bookedEndOfWeek = this.getEndOfWeek(today);
        filtered = bookings.filter(b =>
          b.displayBookingDate.getTime() >= bookedStartOfWeek.getTime() &&
          b.displayBookingDate.getTime() <= bookedEndOfWeek.getTime()
        );
        break;
      case 'bookedThisMonth':
        const bookedStartOfMonth = this.getStartOfMonth(today);
        const bookedEndOfMonth = this.getEndOfMonth(today);
        filtered = bookings.filter(b =>
          b.displayBookingDate.getTime() >= bookedStartOfMonth.getTime() &&
          b.displayBookingDate.getTime() <= bookedEndOfMonth.getTime()
        );
        break;
      default:
        filtered = bookings;
    }
    this.filteredBookings$ = of(filtered);
  }

  openReviews(hotelId: string, hotelName: string): void {
    this.selectedHotelName = hotelName;
    this.reviewService.getReviewsByHotelId(hotelId).subscribe({
      next: (reviews) => {
        this.selectedHotelReviews = reviews;
        this.showReviewModal = true;
      },
      error: (err) => {
        console.error('Failed to load reviews:', err);
        alert('Failed to load reviews.');
      }
    });
  }

  closeReviews(): void {
    this.showReviewModal = false;
    this.selectedHotelReviews = [];
  }

  private normalizeDate(date: Date): Date {
    date.setHours(0, 0, 0, 0);
    return date;
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getDate() === date2.getDate();
  }

  private getStartOfWeek(date: Date): Date {
    const d = new Date(date);
    d.setDate(date.getDate() - date.getDay());
    return this.normalizeDate(d);
  }

  private getEndOfWeek(date: Date): Date {
    const d = new Date(date);
    d.setDate(date.getDate() - date.getDay() + 6);
    d.setHours(23, 59, 59, 999);
    return d;
  }

  private getStartOfMonth(date: Date): Date {
    const d = new Date(date.getFullYear(), date.getMonth(), 1);
    return this.normalizeDate(d);
  }

  private getEndOfMonth(date: Date): Date {
    const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    d.setHours(23, 59, 59, 999);
    return d;
  }
}