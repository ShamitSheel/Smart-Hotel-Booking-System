import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Hotel, HotelPolicies, Room } from '../../../../core/models/hotel.model';
import { HotelListingService } from '../../../../core/services/hotel-listing-service';
import { AuthService } from '../../../../core/services/auth-service';
import { BasicInformationComponent } from '../basic-information/basic-information';
import { LocationContactComponent } from '../location-contact/location-contact';
import { PhotosMediaComponent } from '../photos-media/photos-media';
import { FeaturesAmenitiesComponent } from '../features-amenities/features-amenities';
import { PoliciesComponent } from '../policies/policies';
import { RoomDetailsComponent } from '../room-details/room-details'; // <-- Import RoomDetailsComponent
import { RoomFormComponent } from '../room-form/room-form';// <-- Import RoomFormComponent
import { Subscription } from 'rxjs';
import { ReviewSubmit } from '../review-submit/review-submit';

@Component({
  selector: 'app-add-hotel-page',
  standalone: true,
  imports: [
    CommonModule,
    BasicInformationComponent,
    LocationContactComponent,
    PhotosMediaComponent,
    FeaturesAmenitiesComponent,
    PoliciesComponent,
    RoomDetailsComponent, // <-- Add to imports
    RoomFormComponent, // <-- Add to imports
    ReviewSubmit
  ],
  templateUrl: './add-hotel-page.html',
  styleUrls: ['./add-hotel-page.css']
})
export class AddHotelPageComponent implements OnInit, OnDestroy {
  currentStep = 1;
  hotelData: Partial<Hotel> = {};
  steps = [
    { label: 'Basic Info', key: 1 },
    { label: 'Location & Contact', key: 2 },
    { label: 'Photos & Media', key: 3 },
    { label: 'Features & Amenities', key: 4 },
    { label: 'Policies', key: 5 },
    { label: 'Room Details', key: 6 },
    { label: 'Review & Submit', key: 7 }
  ];

  private currentUserSubscription!: Subscription;
  private storageKey: string = '';
  private currentUserId: string | null = null; // Add a property to store the user ID

  // Properties to manage the room form modal
  showRoomForm = false;
  roomToEdit: Room | null = null;

  constructor(
    private hotelListingService: HotelListingService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.currentUserSubscription = this.authService.currentUser$.subscribe(user => {
      if (user && user.id) {
        this.storageKey = `hotelListingForm-${user.id}`;
        this.currentUserId = user.id; // Store the user ID
        console.log("Current user ID:", this.currentUserId);
        this.loadProgress();
      } else {
        this.storageKey = '';
        this.currentUserId = null;
        this.hotelData = {};
        this.currentStep = 1;
      }
    });
  }

  ngOnDestroy(): void {
    this.saveProgress();
    if (this.currentUserSubscription) {
      this.currentUserSubscription.unsubscribe();
    }
  }

  private loadProgress(): void {
    if (this.storageKey) {
      const savedData = localStorage.getItem(this.storageKey);
      if (savedData) {
        this.hotelData = JSON.parse(savedData);
        console.log("From load progress: ", this.hotelData);

        // Corrected logic: check for highest completed step first
        if (this.hotelData.rooms && this.hotelData.rooms.length > 0) {
          this.currentStep = 6; // Rooms is complete, go to final review
        } else if (this.hotelData.policies) {
          this.currentStep = 5;
        } else if (this.hotelData.features && this.hotelData.amenities) {
          this.currentStep = 4;
        } else if (this.hotelData.images && this.hotelData.images.length > 0) {
          this.currentStep = 3;
        } else if (this.hotelData.address && this.hotelData.contact) {
          this.currentStep = 2;
        }
      }
    }
  }

  private saveProgress(): void {
    if (this.storageKey && Object.keys(this.hotelData).length > 0) {
      localStorage.setItem(this.storageKey, JSON.stringify(this.hotelData));
    }
  }

  // --- Handlers for all steps ---

  onBasicInfoSubmitted(data: Partial<Hotel>): void {
    this.hotelData = { ...this.hotelData, ...data };
    this.saveProgress();
    this.currentStep = 2;
  }

  onLocationContactSubmitted(data: Partial<Hotel>): void {
    this.hotelData = { ...this.hotelData, ...data };
    this.saveProgress();
    this.currentStep = 3;
  }

  onImagesUpdated(data: { images: string[], primaryImage?: string }): void {
    this.hotelData.images = data.images;
    this.hotelData.primaryImage = data.primaryImage;
    this.saveProgress();
  }

  onPhotosMediaSubmitted(data: { files: File[], primaryFile: File | undefined }): void {
    this.hotelListingService.uploadImages(data.files).subscribe(uploadedUrls => {
      this.hotelData.images = uploadedUrls;
      this.hotelData.primaryImage = uploadedUrls.find(url => url.includes(data.primaryFile?.name || ''));
      this.saveProgress();
      this.currentStep = 4;
    });
  }

  onFeaturesAmenitiesSubmitted(data: { features: string[], amenities: string[] }): void {
    this.currentStep = 5;
  }

  onFeaturesAmenitiesUpdated(data: { features: string[], amenities: string[] }): void {
    this.hotelData = { ...this.hotelData, ...data };
    this.saveProgress();
  }

  onPoliciesSubmitted(data: { policies: HotelPolicies, isFullyRefundable: boolean, hasFreeBreakfast: boolean, reserveNowPayLater: boolean }): void {
    this.currentStep = 6;
  }

  onPoliciesUpdated(data: { policies: HotelPolicies, isFullyRefundable: boolean, hasFreeBreakfast: boolean, reserveNowPayLater: boolean }): void {
    this.hotelData.policies = data.policies;
    this.hotelData.isFullyRefundable = data.isFullyRefundable;
    this.hotelData.hasFreeBreakfast = data.hasFreeBreakfast;
    this.hotelData.reserveNowPayLater = data.reserveNowPayLater;
    this.saveProgress();
  }

  // --- Handlers for Room Details Step ---
  onRoomDetailsSubmitted(rooms: Room[]): void {
    this.hotelData.rooms = rooms;
    this.saveProgress();
    this.currentStep = 7;
    console.log('Final data before review:', this.hotelData);
  }

  onAddRoom(): void {
    this.roomToEdit = null;
    this.showRoomForm = true;
  }

  onEditRoom(room: Room): void {
    this.roomToEdit = room;
    this.showRoomForm = true;
  }

  onDeleteRoom(roomId: string): void {
    const updatedRooms = (this.hotelData.rooms || []).filter(room => room.id !== roomId);

    // Create a new hotelData object to trigger change detection in the child
    this.hotelData = { ...this.hotelData, rooms: updatedRooms };

    this.saveProgress();
  }

  onRoomFormSubmitted(room: Room): void {
    console.log('onRoomFormSubmitted called with room:', room);

    let updatedRooms = this.hotelData.rooms ? [...this.hotelData.rooms] : [];

    const existingRoomIndex = updatedRooms.findIndex(r => r.id === room.id);

    if (existingRoomIndex !== -1) {
      // Update the existing room within the new array
      updatedRooms[existingRoomIndex] = room;
      console.log('Updating existing room:', room);
    } else {
      // Push the new room into the new array
      updatedRooms.push(room);
      console.log('Adding new room:', room);
    }

    // CRUCIAL CHANGE: Create a new hotelData object to trigger change detection
    this.hotelData = { ...this.hotelData, rooms: updatedRooms };

    console.log('Rooms array after update:', this.hotelData.rooms);

    this.saveProgress();
    this.showRoomForm = false;
    this.roomToEdit = null;
    console.log('Progress saved, modal closed.');
  }

  onRoomFormCanceled(): void {
    this.showRoomForm = false;
  }

  onReviewSubmit(hotelData: Partial<Hotel>): void {
    console.log('Submitting hotel data:', hotelData);

    if (!this.currentUserId) {
      console.error('User ID not available. Cannot submit hotel.');
      alert('User ID is missing. Please log in again.');
      return;
    }

    // Get the images array from the hotelData
    const uploadedImages = hotelData.images || [];

    const finalHotelData: Hotel = {
      ...hotelData,
      // id: hotelData.id || `hotel-${Date.now()}`,
      id:'',
      rating: 0,
      reviews: 0,
      availabilityMessage: '',
      // managerId: this.currentUserId,
      type: hotelData.type || 'HOTEL',
      amenities: hotelData.amenities || [],
      features: hotelData.features || [],
      images: uploadedImages, // Use the uploaded images
      // CRUCIAL FIX: Set primaryImage to the first image in the array
      primaryImage: uploadedImages.length > 0 ? uploadedImages[0] : undefined,
      policies: hotelData.policies || {} as HotelPolicies,
      rooms: hotelData.rooms || [],
      address: hotelData.address!,
      contact: hotelData.contact!,
      name: hotelData.name!,
      description: hotelData.description!,
      isFullyRefundable: hotelData.isFullyRefundable!,
      hasFreeBreakfast: hotelData.hasFreeBreakfast!,
      reserveNowPayLater: hotelData.reserveNowPayLater!,
    };

    this.hotelListingService.saveHotel(finalHotelData).subscribe({
      next: (savedHotel) => {
        console.log('Hotel saved successfully:', savedHotel);
        alert('Hotel listing submitted successfully!');

        localStorage.removeItem(this.storageKey);

        this.currentStep = 1;
        this.hotelData = {};
      },
      error: (err) => {
        console.error('Error saving hotel:', err);
        alert('An error occurred while saving the hotel. Please try again.');
      }
    });
  }

  onGoBack(): void {
    if (this.currentStep > 1) {
      this.currentStep--;
    }
  }

  goToStep(step: number): void {
    this.currentStep = step;
  }
}