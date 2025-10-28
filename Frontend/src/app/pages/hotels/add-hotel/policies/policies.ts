import { Component, EventEmitter, Input, OnInit, Output, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Hotel, HotelPolicies } from '../../../../core/models/hotel.model';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-policies',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './policies.html',
  styleUrls: ['./policies.css']
})
export class PoliciesComponent implements OnInit, OnDestroy {
  @Input() initialData: Partial<Hotel> = {};
  @Output() formSubmitted = new EventEmitter<{ policies: HotelPolicies, isFullyRefundable: boolean, hasFreeBreakfast: boolean, reserveNowPayLater: boolean }>();
  @Output() goBack = new EventEmitter<void>();
  @Output() policiesUpdated = new EventEmitter<{ policies: HotelPolicies, isFullyRefundable: boolean, hasFreeBreakfast: boolean, reserveNowPayLater: boolean }>();

  policiesForm!: FormGroup;
  private formSubscription!: Subscription;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    const policies = this.initialData.policies || {} as HotelPolicies;

    this.policiesForm = this.fb.group({
      checkInTime: [policies.checkInTime || '', Validators.required],
      checkOutTime: [policies.checkOutTime || '', Validators.required],
      cancellationPolicy: [policies.cancellationPolicy || '', Validators.required],
      smokingAllowed: [policies.smokingAllowed || false],
      petsAllowed: [policies.petsAllowed || false],
      isFullyRefundable: [this.initialData.isFullyRefundable || false],
      hasFreeBreakfast: [this.initialData.hasFreeBreakfast || false],
      reserveNowPayLater: [this.initialData.reserveNowPayLater || false]
    });

    this.formSubscription = this.policiesForm.valueChanges.subscribe(() => {
      this.emitFormUpdate();
    });
  }

  ngOnDestroy(): void {
    if (this.formSubscription) {
      this.formSubscription.unsubscribe();
    }
  }

  private emitFormUpdate(): void {
    const { checkInTime, checkOutTime, cancellationPolicy, smokingAllowed, petsAllowed, ...hotelBooleans } = this.policiesForm.value;
    
    this.policiesUpdated.emit({
      policies: { checkInTime, checkOutTime, cancellationPolicy, smokingAllowed, petsAllowed },
      ...hotelBooleans
    });
  }

  onSubmit(): void {
    if (this.policiesForm.valid) {
      this.formSubmitted.emit(this.getFormData());
    }
  }

  onGoBack(): void {
    this.goBack.emit();
  }
  
  private getFormData(): { policies: HotelPolicies, isFullyRefundable: boolean, hasFreeBreakfast: boolean, reserveNowPayLater: boolean } {
      const { checkInTime, checkOutTime, cancellationPolicy, smokingAllowed, petsAllowed, ...hotelBooleans } = this.policiesForm.value;
      return {
        policies: { checkInTime, checkOutTime, cancellationPolicy, smokingAllowed, petsAllowed },
        ...hotelBooleans
      };
  }
}