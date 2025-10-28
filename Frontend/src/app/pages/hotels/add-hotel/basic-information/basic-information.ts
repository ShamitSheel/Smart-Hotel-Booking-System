import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Hotel } from '../../../../core/models/hotel.model';

@Component({
  selector: 'app-basic-information',
  standalone: true, // <-- Mark as standalone
  imports: [CommonModule, ReactiveFormsModule], // <-- Import required modules
  templateUrl: './basic-information.html',
  styleUrls: ['./basic-information.css']
})
export class BasicInformationComponent implements OnInit {
  @Input() initialData: Partial<Hotel> = {};
  @Output() formSubmitted = new EventEmitter<Partial<Hotel>>();

  basicInfoForm!: FormGroup;
  hotelTypes = ['HOTEL', 'APARTMENT', 'VILLA', 'RESORT', 'COTTAGE', 'CABIN', 'GUEST HOUSE', 'HOSTEL', 'PALACE'];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.basicInfoForm = this.fb.group({
      name: [this.initialData.name || '', [Validators.required, Validators.minLength(3)]],
      description: [this.initialData.description || '', Validators.required],
      type: [this.initialData.type || 'Hotel', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.basicInfoForm.valid) {
      this.formSubmitted.emit(this.basicInfoForm.value);
    }
  }
}