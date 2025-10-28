import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, Observable, Subject, combineLatest } from 'rxjs';
import { filter, map, switchMap, takeUntil, tap } from 'rxjs/operators';
import { Hotel } from '../../../core/models/hotel.model';
import { HotelListingService } from '../../../core/services/hotel-listing-service';
import { BasicInfoView } from './basic-info-view/basic-info-view';
import { AuthService } from '../../../core/services/auth-service';
import { LocationContactViewComponent } from "./location-contact-view/location-contact-view";
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PhotosMediaViewComponent } from "./photos-media-view/photos-media-view";
import { FeaturesAmenitiesViewComponent } from './features-amenities-view/features-amenities-view';
import { HotelPoliciesViewComponent } from './hotel-policies-view/hotel-policies-view';
import { RoomsViewComponent } from './rooms-view/rooms-view';
 
@Component({
  selector: 'app-admin-hotel-details',
  standalone: true,
  imports: [CommonModule, BasicInfoView, LocationContactViewComponent,
    MatProgressSpinnerModule, PhotosMediaViewComponent,
    FeaturesAmenitiesViewComponent, HotelPoliciesViewComponent, RoomsViewComponent],
  templateUrl: './admin-hotel-details.html',
  styleUrls: ['./admin-hotel-details.css']
})
export class AdminHotelDetails implements OnInit, OnDestroy {
  private _hotelSubject = new BehaviorSubject<Hotel | null>(null);
  hotel$ = this._hotelSubject.asObservable().pipe(filter(hotel => !!hotel));
 
  hotelId: string | null = null;
  private destroy$ = new Subject<void>();
 
  private currentUserId: string | null = null;
  private currentUserRole: 'user' | 'admin' | null = null;
 
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private hotelListingService: HotelListingService,
    private authService: AuthService
  ) { }
 
  ngOnInit(): void {
    combineLatest([
      this.route.paramMap.pipe(map(params => params.get('id'))),
      this.authService.currentUser$
    ]).pipe(
      takeUntil(this.destroy$),
      tap(([hotelId, user]) => {
        this.currentUserId = user?.id || null;
        this.currentUserRole = user?.role || null;
        if (hotelId) {
          this.hotelId = hotelId;
        }
      }),
      filter(([hotelId, user]) => !!hotelId && !!user),
      switchMap(([hotelId, user]) => {
        return this.hotelListingService.getHotelById(hotelId!);
      })
    ).subscribe({
      next: (hotel) => {
        // Now, we only need to check if the user is the owner,
        // because the guard already ensures they are a manager or admin.
        const isOwner = hotel.managerId === this.currentUserId;
        const isAdmin = (this.currentUserRole)?.toLocaleLowerCase() === 'admin';
 
        if (!isOwner || !isAdmin) {
          console.error('Access Denied: User is not the hotel owner or an admin.');
          alert('You do not have permission to view this hotel.');
          this.router.navigate(['/admin/dashboard']);
        } else {
          this._hotelSubject.next(hotel);
        }
      },
      error: (err) => {
        console.error('Failed to load hotel details', err);
        this.router.navigate(['/admin/dashboard']);
      }
    });
  }
 
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
 
  onBasicInfoUpdated(updatedData: Partial<Hotel>): void {
    if (this.hotelId) {
      // Use 'as any' to tell TypeScript the shape is correct for this specific call
      this.hotelListingService.updateHotelBasicInfo(this.hotelId, updatedData as any).subscribe({
        next: (response) => {
          console.log('Basic info updated successfully:', response);
          alert('Basic information updated successfully!');
          this._hotelSubject.next(response);
        },
        error: (err) => {
          console.error('Error updating basic info:', err);
          alert('Failed to update basic information.');
        }
      });
    }
  }
 
  onLocationContactUpdated(updatedData: Partial<Hotel>): void {
    if (this.hotelId) {
      // Use 'as any' here as well
      this.hotelListingService.updateHotelContactAddress(this.hotelId, updatedData as any).subscribe({
        next: (response) => {
          console.log('Location & Contact updated successfully:', response);
          alert('Location & Contact updated successfully!');
          this._hotelSubject.next(response);
        },
        error: (err) => {
          console.error('Error updating location & contact:', err);
          alert('Failed to update location & contact.');
        }
      });
    }
  }
 
  onPhotosMediaUpdated(updatedData: Partial<Hotel>): void {
    if (this.hotelId) {
      // And finally, use 'as any' here
      this.hotelListingService.updateHotelImages(this.hotelId, updatedData as any).subscribe({
        next: (response) => {
          console.log('Photos updated successfully:', response);
          alert('Photos updated successfully!');
          this._hotelSubject.next(response);
        },
        error: (err) => {
          console.error('Error updating photos:', err);
          alert('Failed to update photos.');
        }
      });
    }
  }
 
  onFeaturesAmenitiesUpdated(updatedData: Partial<Hotel>): void {
    if (this.hotelId) {
      this.hotelListingService.updateHotelFeaturesAmenities(this.hotelId, updatedData as any).subscribe({
        next: (response) => {
          console.log('Features & Amenities updated successfully:', response);
          alert('Features & Amenities updated successfully!');
          // Refresh the hotel data directly with the response from the server
          this._hotelSubject.next(response);
        },
        error: (err) => {
          console.error('Error updating features & amenities:', err);
          alert('Failed to update features & amenities.');
        }
      });
    }
  }
 
  onPoliciesUpdated(updatedData: Partial<Hotel>): void {
    if (this.hotelId) {
      this.hotelListingService.updateHotelPolicies(this.hotelId, updatedData as any).subscribe({
        next: (response) => {
          console.log('Policies updated successfully:', response);
          alert('Policies updated successfully!');
          // Refresh the hotel data directly with the response from the server
          this._hotelSubject.next(response);
        },
        error: (err) => {
          console.error('Error updating policies:', err);
          alert('Failed to update policies.');
        }
      });
    }
  }
 
  onRoomsUpdated(roomUpdates: any[]): void {
    if (this.hotelId) {
      this.hotelListingService.updateHotelRooms(this.hotelId, roomUpdates).subscribe({
        next: (response) => {
          console.log('Rooms updated successfully:', response);
          alert('Rooms updated successfully!');
          this._hotelSubject.next(response);
        },
        error: (err) => {
          console.error('Error updating rooms:', err);
          alert('Failed to update rooms.');
        }
      });
    }
  }
}
 