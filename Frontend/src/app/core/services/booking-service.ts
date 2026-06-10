import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Booking, EnhancedBooking, DashboardData } from '../models/booking.models';
 
@Injectable({
  providedIn: 'root',
})
export class BookingService {
  private apiUrl = 'https://hotelify-api-gateway.onrender.com/api/bookings';
  private couponUrl = 'https://hotelify-api-gateway.onrender.com/api/coupons';
 
  constructor(private http: HttpClient) {}
 
  // Check room availability with correct field mapping
  checkRoomAvailability(availabilityRequest: {
    roomId: string;
    hotelId: string;
    checkInDate: string;
    checkOutDate: string;
    numberOfRooms: number;
    totalRoomQuantity: number;
  }): Observable<{ available: boolean; message: string; availableRooms: number }> {
   
    // Map frontend fields to backend expected fields
    const backendRequest = {
      roomId: availabilityRequest.roomId,
      hotelId: availabilityRequest.hotelId,
      checkInDate: availabilityRequest.checkInDate,
      checkOutDate: availabilityRequest.checkOutDate,
      requiredNumberOfRooms: availabilityRequest.numberOfRooms,
      quantityOfRooms: availabilityRequest.totalRoomQuantity
    };
 
    return this.http.post<{ available: boolean; message: string; availableRooms: number }>(
      `${this.apiUrl}/availability`,
      backendRequest
    ).pipe(
      catchError((error) => {
        console.error('Error checking availability:', error);
        return of({ available: false, message: 'Error checking availability', availableRooms: 0 });
      })
    );
  }
 
  createBooking(booking: Omit<Booking, 'id'>): Observable<Booking> {
    const bookingRequest = {
      roomId: booking.roomId,
      hotelId: booking.hotelId,
      checkInDate: booking.checkInDate,
      checkOutDate: booking.checkOutDate,
      bookingDate: booking.bookingDate,
      numberOfRooms: booking.numberOfRooms,
      totalAmount: booking.totalAmount,
      discountApplied: booking.discountApplied || 0,
      finalAmount: booking.finalAmount,
      paymentMethod: this.mapPaymentMethod(booking.paymentMethod),
      guestDetails: booking.guestDetails
    };
 
    return this.http.post<Booking>(this.apiUrl, bookingRequest).pipe(
      catchError((error) => {
        console.error('Error creating booking:', error);
        throw error;
      })
    );
  }
 
  getMyBookings(): Observable<Booking[]> {
    return this.http.get<Booking[]>(`${this.apiUrl}/my-bookings`);
  }
 
  getBookingById(bookingId: string): Observable<Booking> {
    return this.http.get<Booking>(`${this.apiUrl}/${bookingId}`);
  }
 
  getBookingsByHotelIds(hotelIds: string[]): Observable<Booking[]> {
    const params = hotelIds.map(id => `hotelIds=${id}`).join('&');
    return this.http.get<Booking[]>(`${this.apiUrl}/search/by-hotels?${params}`);
  }

  // NEW METHOD for fetching manager's bookings
  getBookingsByManagerId(managerId: string): Observable<EnhancedBooking[]> {
    return this.http.get<EnhancedBooking[]>(`${this.apiUrl}/search/by-manager/${managerId}`).pipe(
      catchError((error) => {
        console.error('Error fetching bookings by manager ID:', error);
        return of([]); // Return an empty array on error to prevent crashes
      })
    );
  }

  getManagerDashboardData(managerId: string): Observable<DashboardData> {
    // --- Create a default, empty object that matches the DashboardData interface ---
    const defaultDashboardData: DashboardData = {
      totalBookingsCount: 0,
      upcomingBookingsCount: 0,
      todayCheckInsCount: 0,
      todayCheckOutsCount: 0,
      totalRevenue: 0,
      recentBookings: []
    };
 
    return this.http.get<DashboardData>(`${this.apiUrl}/dashboard/manager/${managerId}`).pipe(
      catchError((error) => {
        console.error('Error fetching manager dashboard data:', error);
        // --- Instead of returning null, return the default object ---
        return of(defaultDashboardData);
      })
    );
  }
 
  validateCoupon(couponCode: string, totalAmount: number): Observable<any> {
    const request = {
      couponCode: couponCode,
      totalAmount: totalAmount
    };
   
    return this.http.post<any>(`${this.couponUrl}/validate`, request).pipe(
      catchError((error) => {
        console.error('Error validating coupon:', error);
        return of({ valid: false, message: 'Invalid coupon code' });
      })
    );
  }
 
  private mapPaymentMethod(method: string): string {
    switch (method) {
      case 'Pay at property': return 'PAY_AT_PROPERTY';
      case 'UPI': return 'UPI';
      case 'Card': return 'CARD';
      default: return 'PAY_AT_PROPERTY';
    }
  }
}