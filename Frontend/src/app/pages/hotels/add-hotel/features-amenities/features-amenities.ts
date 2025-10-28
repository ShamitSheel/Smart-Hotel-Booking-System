import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormArray, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { Hotel } from '../../../../core/models/hotel.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-features-amenities',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './features-amenities.html',
  styleUrls: ['./features-amenities.css']
})
export class FeaturesAmenitiesComponent implements OnInit, OnDestroy {
  @Input() initialData: Partial<Hotel> = {};
  @Output() formSubmitted = new EventEmitter<{ features: string[], amenities: string[] }>();
  @Output() goBack = new EventEmitter<void>();
  @Output() featuresAmenitiesUpdated = new EventEmitter<{ features: string[], amenities: string[] }>(); // <-- New Output

  featuresAmenitiesForm!: FormGroup;
  newFeatureControl = new FormControl('', [Validators.required]);
  newAmenityControl = new FormControl('', [Validators.required]);

  availableFeatures = [
    'Swimming Pool', 'Spa', 'Gym', 'Restaurant', 'Bar', 'Parking',
    'Meeting Rooms', 'Pet-friendly', 'Family rooms'
  ];
  availableAmenities = [
    'Free WiFi', 'Air conditioning', 'TV', 'Coffee machine',
    'Mini-bar', 'Hair dryer', 'Free toiletries', 'Balcony'
  ];
  private formSubscription!: Subscription;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.featuresAmenitiesForm = this.fb.group({
      features: this.fb.array([]),
      amenities: this.fb.array([])
    });

    this.setFormValues();

    // Subscribe to valueChanges to emit updates in real-time
    this.formSubscription = this.featuresAmenitiesForm.valueChanges.subscribe(() => {
      this.emitFormUpdate();
    });
  }

  ngOnDestroy(): void {
    if (this.formSubscription) {
      this.formSubscription.unsubscribe();
    }
  }

  setFormValues(): void {
    const initialFeatures = this.initialData.features || [];
    const initialAmenities = this.initialData.amenities || [];

    initialFeatures.forEach(feature => {
      if (!this.availableFeatures.includes(feature)) {
        this.availableFeatures.push(feature);
      }
    });
    initialAmenities.forEach(amenity => {
      if (!this.availableAmenities.includes(amenity)) {
        this.availableAmenities.push(amenity);
      }
    });

    this.availableFeatures.forEach(feature => {
      const isSelected = initialFeatures.includes(feature);
      (this.featuresAmenitiesForm.get('features') as FormArray).push(new FormControl(isSelected));
    });

    this.availableAmenities.forEach(amenity => {
      const isSelected = initialAmenities.includes(amenity);
      (this.featuresAmenitiesForm.get('amenities') as FormArray).push(new FormControl(isSelected));
    });
  }

  addNewFeature(): void {
    const newFeature = this.newFeatureControl.value;
    if (this.newFeatureControl.valid && newFeature && !this.availableFeatures.includes(newFeature)) {
      this.availableFeatures.push(newFeature);
      (this.featuresAmenitiesForm.get('features') as FormArray).push(new FormControl(true));
      this.newFeatureControl.reset();
    }
  }

  addNewAmenity(): void {
    const newAmenity = this.newAmenityControl.value;
    if (this.newAmenityControl.valid && newAmenity && !this.availableAmenities.includes(newAmenity)) {
      this.availableAmenities.push(newAmenity);
      (this.featuresAmenitiesForm.get('amenities') as FormArray).push(new FormControl(true));
      this.newAmenityControl.reset();
    }
  }

  private emitFormUpdate(): void {
    const selectedFeatures: string[] = [];
    const selectedAmenities: string[] = [];

    (this.featuresAmenitiesForm.get('features') as FormArray).controls.forEach((control, index) => {
      if (control.value) {
        selectedFeatures.push(this.availableFeatures[index]);
      }
    });

    (this.featuresAmenitiesForm.get('amenities') as FormArray).controls.forEach((control, index) => {
      if (control.value) {
        selectedAmenities.push(this.availableAmenities[index]);
      }
    });

    this.featuresAmenitiesUpdated.emit({
      features: selectedFeatures,
      amenities: selectedAmenities
    });
  }

  onSubmit(): void {
    this.formSubmitted.emit({
      features: this.getSelectedFeatures(),
      amenities: this.getSelectedAmenities()
    });
  }

  private getSelectedFeatures(): string[] {
    const selectedFeatures: string[] = [];
    (this.featuresAmenitiesForm.get('features') as FormArray).controls.forEach((control, index) => {
        if (control.value) {
            selectedFeatures.push(this.availableFeatures[index]);
        }
    });
    return selectedFeatures;
  }

  private getSelectedAmenities(): string[] {
    const selectedAmenities: string[] = [];
    (this.featuresAmenitiesForm.get('amenities') as FormArray).controls.forEach((control, index) => {
        if (control.value) {
            selectedAmenities.push(this.availableAmenities[index]);
        }
    });
    return selectedAmenities;
  }

  onGoBack(): void {
    this.goBack.emit();
  }
}