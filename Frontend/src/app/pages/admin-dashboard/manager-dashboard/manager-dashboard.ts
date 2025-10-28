import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { BookingService } from '../../../core/services/booking-service';
import { HotelListingService } from '../../../core/services/hotel-listing-service';
import { AuthService } from '../../../core/services/auth-service';
import { Booking, EnhancedBooking, DashboardData } from '../../../core/models/booking.models';
import { Hotel, Room } from '../../../core/models/hotel.model';
import { BehaviorSubject, combineLatest, map, Observable, Subject, takeUntil, tap } from 'rxjs';
 
 
// interface DashboardData {
//   totalBookingsCount: number;
//   upcomingBookingsCount: number;
//   todayCheckInsCount: number;
//   todayCheckOutsCount: number;
//   totalRevenue: number;
//   recentBookings: EnhancedBooking[];
// }
 
@Component({
  selector: 'app-manager-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, MatProgressSpinnerModule],
  templateUrl: './manager-dashboard.html',
  styleUrls: ['./manager-dashboard.css']
})
 
export class ManagerDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  dashboardData$: BehaviorSubject<DashboardData | null> = new BehaviorSubject<DashboardData | null>(null);
  isLoading = true;
  userName: string = 'Hotel Manager';
 
  constructor(
    private authService: AuthService,
    private bookingService: BookingService
    // HotelListingService is no longer needed here
  ) { }
 
  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.userName = `${currentUser.firstName} ${currentUser.lastName}` || 'Hotel Manager';
      this.loadDashboardData(currentUser.id);
    } else {
      this.isLoading = false;
      console.warn('User not logged in, cannot load dashboard data.');
    }
  }
 
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
 
  loadDashboardData(managerId: string): void {
    this.isLoading = true;
   
    this.bookingService.getManagerDashboardData(managerId).pipe(
      takeUntil(this.destroy$),
      // Convert date strings in recentBookings to Date objects for the view
      map(data => {
        if (!data) return null;
       
        const enhancedRecentBookings = data.recentBookings.map(booking => ({
          ...booking,
          displayCheckInDate: new Date(booking.checkInDate),
          displayCheckOutDate: new Date(booking.checkOutDate),
          displayBookingDate: new Date(booking.bookingDate),
        }));
       
        return { ...data, recentBookings: enhancedRecentBookings };
      }),
      tap(data => {
        this.dashboardData$.next(data);
        this.isLoading = false;
      })
    ).subscribe({
      error: (err) => {
        console.error('Failed to load dashboard data:', err);
        this.isLoading = false;
      }
    });
  }
}