export interface Booking {
  id: string;
  userId: string;
  roomId: string;
  hotelId: string;
  checkInDate: string; 
  checkOutDate: string; 
  bookingDate: string; 
  numberOfRooms: number;
  totalAmount: number;
  discountApplied?: number;
  finalAmount: number;
  paymentMethod: 'Pay at property' | 'Pay now' | 'UPI' | 'Card';
  status: 'PENDING' | 'CONFIRMED' | 'CANCELLED';
  guestDetails: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
}

export interface EnhancedBooking extends Booking {
  hotelName: string;
  roomName: string;
  customerName: string; 
  displayCheckInDate: Date; 
  displayCheckOutDate: Date; 
  displayBookingDate: Date; 
}

export interface DashboardData {
  totalBookingsCount: number;
  upcomingBookingsCount: number;
  todayCheckInsCount: number;
  todayCheckOutsCount: number;
  totalRevenue: number;
  recentBookings: EnhancedBooking[];
}