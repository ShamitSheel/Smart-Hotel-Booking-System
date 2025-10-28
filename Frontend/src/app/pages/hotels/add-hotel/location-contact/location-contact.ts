import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Hotel } from '../../../../core/models/hotel.model';
import { Address } from '../../../../core/models/hotel.model'; // Import Address

@Component({
  selector: 'app-location-contact',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './location-contact.html',
  styleUrls: ['./location-contact.css']
})
export class LocationContactComponent implements OnInit {
  @Input() initialData: Partial<Hotel> = {};
  @Output() formSubmitted = new EventEmitter<Partial<Hotel>>();
  @Output() goBack = new EventEmitter<void>();

  locationContactForm!: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    // Explicitly cast to Address and Contact interfaces
    const address: Address = this.initialData.address || {} as Address;
    const contact: { phone: string; email: string; website?: string; } = this.initialData.contact || {} as { phone: string; email: string; website?: string; };

    this.locationContactForm = this.fb.group({
      address: this.fb.group({
        street: [address.street || '', Validators.required],
        area: [address.area || ''],
        landmark: [address.landmark || ''],
        city: [address.city || '', Validators.required],
        state: [address.state || '', Validators.required],
        country: [address.country || '', Validators.required],
        zipCode: [address.zipCode || '', [Validators.required, Validators.pattern(/^\d{6}$/)]]
      }),
      contact: this.fb.group({
        phone: [contact.phone || '', [Validators.required, Validators.pattern(/^\d{10}$/)]],
        email: [contact.email || '', [Validators.required, Validators.email]],
        website: [contact.website || '', Validators.pattern(/^(https?|ftp):\/\/[^\s/$.?#].[^\s]*$/i)]
      })
    });
  }

  onSubmit(): void {
    if (this.locationContactForm.valid) {
      this.formSubmitted.emit(this.locationContactForm.value);
    }
  }

  onGoBack(): void {
    this.goBack.emit();
  }
}