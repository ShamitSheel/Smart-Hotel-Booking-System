// src/app/pages/hotels/add-hotel/room-details/room-form/room-form.component.ts

import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Room } from '../../../../core/models/hotel.model';
import { Subscription } from 'rxjs';
import { debounceTime } from 'rxjs/operators';

@Component({
  selector: 'app-room-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './room-form.html',
  styleUrls: ['./room-form.css']
})
export class RoomFormComponent implements OnInit, OnDestroy {
  @Input() roomToEdit: Room | null = null;
  @Output() formSubmitted = new EventEmitter<Room>();
  @Output() formCanceled = new EventEmitter<void>();

  roomForm!: FormGroup;
  availableAmenities = [
    'WiFi', 'Air conditioning', 'TV', 'Mini-bar', 'Hair dryer',
    'Balcony', 'En-suite bathroom', 'Room service', 'Work desk'
  ];
  private formSubscription!: Subscription;
  private priceChangesSubscription!: Subscription;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    const room = this.roomToEdit || {} as Partial<Room>;

    this.roomForm = this.fb.group({
      id: [room.id || ''],
      name: [room.name || '', Validators.required],
      description: [room.description || '', Validators.required],
      originalPrice: [room.originalPrice || null, [Validators.required, Validators.min(0)]],
      discountedPrice: [room.discountedPrice || null, [Validators.min(0)]],
      maxGuests: [room.maxGuests || null, [Validators.required, Validators.min(1)]],
      bedType: [room.bedType || '', Validators.required],
      isAvailable: [room.isAvailable !== undefined ? room.isAvailable : true],
      quantityAvailable: [room.quantityAvailable || null, [Validators.required, Validators.min(1)]],
      amenities: this.fb.array([]),
      images: [room.images || []],
      discountPercentage: [room.discountPercentage || 0],
      totalPriceIncludesTaxes: [room.totalPriceIncludesTaxes || null]
    });

    this.setAmenityCheckboxes();

    // Check if form controls exist before subscribing to prevent the type error
    const originalPriceControl = this.roomForm.get('originalPrice');
    const discountedPriceControl = this.roomForm.get('discountedPrice');

    if (originalPriceControl && discountedPriceControl) {
      this.priceChangesSubscription = originalPriceControl.valueChanges
        .pipe(debounceTime(300))
        .subscribe(() => this.calculatePrices());

      this.priceChangesSubscription.add(discountedPriceControl.valueChanges
        .pipe(debounceTime(300))
        .subscribe(() => this.calculatePrices()));
    }
  }

  ngOnDestroy(): void {
    if (this.priceChangesSubscription) {
      this.priceChangesSubscription.unsubscribe();
    }
  }

  // New method to handle price calculations
  private calculatePrices(): void {
    const originalPrice = this.roomForm.get('originalPrice')?.value;
    let discountedPrice = this.roomForm.get('discountedPrice')?.value;

    if (originalPrice !== null) {
      // Calculate tax-inclusive price based on the final price
      const priceAfterDiscount = discountedPrice !== null ? discountedPrice : originalPrice;
      const taxRate = 0.18; // 18% tax rate
      const totalPriceWithTaxes = priceAfterDiscount * (1 + taxRate);
      this.roomForm.get('totalPriceIncludesTaxes')?.setValue(totalPriceWithTaxes, { emitEvent: false });

      // Calculate discount percentage
      if (discountedPrice !== null && originalPrice > discountedPrice) {
        const discount = ((originalPrice - discountedPrice) / originalPrice) * 100;
        this.roomForm.get('discountPercentage')?.setValue(Math.round(discount), { emitEvent: false });
      } else {
        this.roomForm.get('discountPercentage')?.setValue(0, { emitEvent: false });
      }
    }
  }

  // ... (setAmenityCheckboxes, getSelectedAmenities, onFileSelected, onRemoveImage)
  setAmenityCheckboxes(): void {
    const initialAmenities = this.roomToEdit?.amenities || [];
    const amenitiesArray = this.roomForm.get('amenities') as FormArray;

    this.availableAmenities.forEach(amenity => {
      const isSelected = initialAmenities.includes(amenity);
      amenitiesArray.push(new FormControl(isSelected));
    });
  }

  getSelectedAmenities(): string[] {
    const amenitiesArray = this.roomForm.get('amenities') as FormArray;
    return amenitiesArray.controls
      .map((control, i) => control.value ? this.availableAmenities[i] : null)
      .filter((amenity): amenity is string => amenity !== null);
  }

  onFileSelected(event: any): void {
    const files = event.target.files;
    if (files && files.length > 0) {
      const newImageUrls = Array.from(files).map((file: any) => URL.createObjectURL(file as File));

      const currentImages = this.roomForm.get('images')?.value || [];
      this.roomForm.get('images')?.setValue([...currentImages, ...newImageUrls]);
    }
  }

  onRemoveImage(image: string): void {
    const currentImages = this.roomForm.get('images')?.value;
    const updatedImages = currentImages.filter((img: string) => img !== image);
    this.roomForm.get('images')?.setValue(updatedImages);
  }

  onSubmit(): void {
    if (this.roomForm.valid) {
      const formValue = this.roomForm.value;
      const roomData: Room = {
        id: formValue.id,
        name: formValue.name,
        description: formValue.description,
        originalPrice: formValue.originalPrice,
        discountedPrice: formValue.discountedPrice || formValue.originalPrice,
        discountPercentage: formValue.discountPercentage,
        totalPriceIncludesTaxes: formValue.totalPriceIncludesTaxes,
        maxGuests: formValue.maxGuests,
        bedType: formValue.bedType,
        amenities: this.getSelectedAmenities(),
        images: formValue.images,
        isAvailable: formValue.isAvailable,
        quantityAvailable: formValue.quantityAvailable,
      };
      console.log('RoomFormComponent: Submitting roomData:', roomData);
      this.formSubmitted.emit(roomData);
    }
  }

  onCancel(): void {
    this.formCanceled.emit();
  }
}