import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Hotel } from '../../../../core/models/hotel.model';

@Component({
  selector: 'app-location-contact-view',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './location-contact-view.html',
  styleUrls: ['./location-contact-view.css']
})
export class LocationContactViewComponent implements OnInit {
  @Input() initialData!: Hotel;
  @Output() dataUpdated = new EventEmitter<Partial<Hotel>>();
  
  isEditing = false;
  locationContactForm!: FormGroup;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.locationContactForm = this.fb.group({
      address: this.fb.group({
        street: [this.initialData.address.street, Validators.required],
        city: [this.initialData.address.city, Validators.required],
        state: [this.initialData.address.state, Validators.required],
        zipCode: [this.initialData.address.zipCode, Validators.required],
        country: [this.initialData.address.country, Validators.required],
      }),
      contact: this.fb.group({
        phone: [this.initialData.contact.phone, Validators.required],
        email: [this.initialData.contact.email, [Validators.required, Validators.email]],
        website: [this.initialData.contact.website, Validators.pattern('^(http|https)://.*$')]
      })
    });
  }

  onEdit(): void {
    this.isEditing = true;
  }

  onCancel(): void {
    this.isEditing = false;
    this.locationContactForm.patchValue(this.initialData);
  }

  onSave(): void {
    if (this.locationContactForm.valid) {
      this.dataUpdated.emit(this.locationContactForm.value);
      this.isEditing = false;
    }
  }
}