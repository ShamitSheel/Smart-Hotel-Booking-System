import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Room } from '../../../core/models/hotel.model';
import { BookingService } from '../../../core/services/booking-service';
import { Booking } from '../../../core/models/booking.models';
import { AuthService } from '../../../core/services/auth-service';

@Component({
  selector: 'app-booking-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './booking-form.html',
  styleUrl: './booking-form.css',
})
export class BookingForm implements OnInit {
  room!: Room;
  userId!: string;
  hotelId!: string;
  userLoyaltyPoints: number = 0;
  useLoyaltyPoints: boolean = false;
  pointsToUse: number = 0;
  loyaltyPointsDiscount: number = 0;
  availableRooms: number = 0;
  isCheckingAvailability: boolean = false;

  guestDetails = {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  };

  bookingDetails = {
    checkInDate: '',
    checkOutDate: '',
    numberOfRooms: 1,
    paymentOption: 'Pay at property',
    upiId: '',
    cardNumber: '',
    cardExpiry: '',
    cardCvv: '',
    couponCode: '',
  };

  couponDiscount: number = 0;
  totalPrice: number = 0;
  finalPrice: number = 0;
  errorMessage: string = '';
  successMessage: string = '';
  isPaymentOnline: boolean = false;
  dateError: string = '';
  availabilityError: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private bookingService: BookingService,
    private authService: AuthService,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe((params) => {
      const roomId = params.get('roomId');
      this.hotelId = params.get('hotelId') as string;

      if (roomId && this.hotelId) {
        const hotelUrl = `https://hotelify-api-gateway.onrender.com/api/hotels/${this.hotelId}`;

        this.http.get<any>(hotelUrl).subscribe(
          (hotelData) => {
            if (hotelData && hotelData.rooms) {
              this.room = hotelData.rooms.find((r: any) => r.id === roomId);
              if (this.room) {
                this.availableRooms = this.room.quantityAvailable;
                this.calculateTotal();
              } else {
                this.errorMessage = 'Room not found. Please check the URL.';
              }
            } else {
              this.errorMessage = 'Hotel data or rooms not found.';
            }
          },
          (error) => {
            console.error('Failed to fetch hotel data:', error);
            this.errorMessage = 'Failed to load hotel data. Please try again.';
          }
        );
      } else {
        this.errorMessage = 'Invalid room or hotel ID provided.';
      }
    });

    this.authService.currentUser$.subscribe((user) => {
      if (user) {
        this.userId = user.id;
        this.guestDetails.email = user.email;
        this.guestDetails.firstName = user.firstName;
        this.guestDetails.lastName = user.lastName;
        this.userLoyaltyPoints = user.loyaltyPoints || 0;
        this.pointsToUse = this.userLoyaltyPoints;
      }
    });
  }

  onPaymentOptionChange(): void {
    this.isPaymentOnline = this.bookingDetails.paymentOption !== 'Pay at property';
  }

  validateDatesAndCalculate(): void {
    const checkIn = new Date(this.bookingDetails.checkInDate);
    const checkOut = new Date(this.bookingDetails.checkOutDate);

    if (checkIn && checkOut && checkOut < checkIn) {
      this.dateError = 'Check-out date must be on or after the check-in date.';
      this.totalPrice = 0;
      this.finalPrice = 0;
      return;
    }
    this.dateError = '';
    this.checkAvailabilityAndCalculate();
  }

  onNumberOfRoomsChange(): void {
    this.checkAvailabilityAndCalculate();
  }

// Update only the checkAvailabilityAndCalculate method:

checkAvailabilityAndCalculate(): void {
  if (!this.room || !this.bookingDetails.checkInDate || !this.bookingDetails.checkOutDate || this.dateError) {
    this.totalPrice = 0;
    this.finalPrice = 0;
    return;
  }

  // Ensure we have valid dates that are not in the past
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const checkInDate = new Date(this.bookingDetails.checkInDate);
  checkInDate.setHours(0, 0, 0, 0);

  if (checkInDate < today) {
    this.availabilityError = 'Check-in date must be today or in the future';
    this.totalPrice = 0;
    this.finalPrice = 0;
    return;
  }

  this.isCheckingAvailability = true;
  this.availabilityError = '';

  const availabilityRequest = {
    roomId: this.room.id,
    hotelId: this.hotelId,
    checkInDate: this.bookingDetails.checkInDate,
    checkOutDate: this.bookingDetails.checkOutDate,
    numberOfRooms: this.bookingDetails.numberOfRooms,
    totalRoomQuantity: this.room.quantityAvailable // Pass the total room quantity
  };

  this.bookingService.checkRoomAvailability(availabilityRequest).subscribe({
    next: (response) => {
      this.isCheckingAvailability = false;
      if (response.available) {
        this.availableRooms = response.availableRooms;
        this.calculateTotal();
        this.availabilityError = '';
      } else {
        this.availabilityError = response.message;
        this.availableRooms = response.availableRooms;
        this.totalPrice = 0;
        this.finalPrice = 0;
      }
    },
    error: (error) => {
      this.isCheckingAvailability = false;
      this.availabilityError = 'Failed to check room availability. Please try again.';
      console.error('Availability check failed:', error);
    }
  });
}


  calculateTotal(): void {
    if (!this.room || !this.bookingDetails.checkInDate || !this.bookingDetails.checkOutDate || this.dateError || this.availabilityError) {
      this.totalPrice = 0;
      this.finalPrice = 0;
      return;
    }

    const checkIn = new Date(this.bookingDetails.checkInDate);
    const checkOut = new Date(this.bookingDetails.checkOutDate);
    const diffTime = Math.abs(checkOut.getTime() - checkIn.getTime());
    const numberOfDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const totalDays = numberOfDays > 0 ? numberOfDays : 1;

    const roomPrice = this.room.discountedPrice;
    this.totalPrice = roomPrice * this.bookingDetails.numberOfRooms * totalDays;
    this.loyaltyPointsDiscount = 0;

    if (this.useLoyaltyPoints && this.pointsToUse > 0) {
      this.loyaltyPointsDiscount = Math.min(this.pointsToUse, this.totalPrice);
    } else {
      this.pointsToUse = 0;
    }

    this.finalPrice = this.totalPrice - this.couponDiscount - this.loyaltyPointsDiscount;
  }

  onToggleLoyaltyPoints(): void {
    if (this.useLoyaltyPoints) {
      this.pointsToUse = this.userLoyaltyPoints;
    } else {
      this.pointsToUse = 0;
    }
    this.calculateTotal();
  }

  applyCoupon(): void {
    this.errorMessage = '';
    this.successMessage = '';
    
    if (!this.bookingDetails.couponCode.trim()) {
      this.errorMessage = 'Please enter a coupon code.';
      return;
    }

    this.bookingService.validateCoupon(this.bookingDetails.couponCode, this.totalPrice)
      .subscribe((response) => {
        if (response.valid) {
          this.couponDiscount = response.discountAmount;
          this.calculateTotal();
          this.successMessage = `Coupon applied! You saved ₹${this.couponDiscount}`;
        } else {
          this.couponDiscount = 0;
          this.calculateTotal();
          this.errorMessage = response.message || 'Invalid or expired coupon code.';
        }
      });
  }

  onSubmit(form: NgForm): void {
    this.errorMessage = '';
    this.successMessage = '';

    if (form.invalid || !!this.dateError || !!this.availabilityError) {
      this.errorMessage = 'Please fill out all required fields correctly and ensure room availability.';
      return;
    }

    if (this.bookingDetails.numberOfRooms > this.availableRooms) {
      this.errorMessage = `Only ${this.availableRooms} rooms are available for the selected dates.`;
      return;
    }

    if (
      this.bookingDetails.paymentOption === 'Pay now' &&
      !this.validatePaymentDetails()
    ) {
      this.errorMessage = 'Please provide valid payment details.';
      return;
    }

    if (!this.userId || !this.hotelId || !this.room?.id) {
      this.errorMessage = 'Booking data is not yet loaded. Please try again.';
      return;
    }
    
    if (this.useLoyaltyPoints && this.pointsToUse > this.finalPrice) {
        this.errorMessage = 'Points used cannot exceed the final booking price.';
        return;
    }

    const today = new Date();
    const bookingDate = today.toISOString().slice(0, 10);

    const newBooking: Omit<Booking, 'id'> = {
      userId: this.userId,
      roomId: this.room.id,
      hotelId: this.hotelId,
      checkInDate: this.bookingDetails.checkInDate,
      checkOutDate: this.bookingDetails.checkOutDate,
      bookingDate: bookingDate,
      numberOfRooms: this.bookingDetails.numberOfRooms,
      totalAmount: this.totalPrice,
      discountApplied: this.couponDiscount + this.loyaltyPointsDiscount,
      finalAmount: this.finalPrice,
      paymentMethod: this.bookingDetails.paymentOption as any,
      status: 'PENDING',
      guestDetails: this.guestDetails,
    };

    this.bookingService.createBooking(newBooking).subscribe(
      (booking) => {
        let updatedLoyaltyPoints = this.userLoyaltyPoints;
        if (this.useLoyaltyPoints) {
          updatedLoyaltyPoints -= this.loyaltyPointsDiscount;
        }
        const pointsEarned = Math.floor(this.finalPrice * 0.05);
        updatedLoyaltyPoints += pointsEarned;

        this.authService
          .updateLoyaltyPoints(this.userId, updatedLoyaltyPoints)
          .subscribe(
            () => {
              console.log('Booking successful:', booking);
              this.router.navigate(['/bookings']);
            },
            (error) => {
              console.error('Failed to update loyalty points:', error);
              this.router.navigate(['/bookings']);
            }
          );
      },
      (error) => {
        console.error('Booking failed:', error);
        this.errorMessage = error.error?.message || 'Booking failed. Please try again.';
      }
    );
  }

  // Add this method to the BookingForm component:

getTodayDate(): string {
  const today = new Date();
  return today.toISOString().split('T')[0];
}


  validatePaymentDetails(): boolean {
    if (this.bookingDetails.paymentOption === 'UPI') {
      const upiPattern = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
      return upiPattern.test(this.bookingDetails.upiId);
    }
    if (this.bookingDetails.paymentOption === 'Card') {
      const cardNumberPattern = /^(?:4[0-9]{12}(?:[0-9]{3})?|5[1-5][0-9]{14}|3[47][0-9]{13}|6(?:011|5[0-9]{2})[0-9]{12})$/;
      const cardExpiryPattern = /(0[1-9]|1[0-2])\/\d{2}/;
      const cardCvvPattern = /\d{3,4}/;

      return (
        cardNumberPattern.test(this.bookingDetails.cardNumber) &&
        cardExpiryPattern.test(this.bookingDetails.cardExpiry) &&
        cardCvvPattern.test(this.bookingDetails.cardCvv)
      );
    }
    return true;
  }
  
  clearUpiDetails(): void {
    this.bookingDetails.upiId = '';
  }

  clearCardDetails(): void {
    this.bookingDetails.cardNumber = '';
    this.bookingDetails.cardExpiry = '';
    this.bookingDetails.cardCvv = '';
  }
}
