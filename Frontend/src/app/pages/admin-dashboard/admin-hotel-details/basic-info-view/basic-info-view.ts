import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Hotel } from '../../../../core/models/hotel.model';

@Component({
  selector: 'app-basic-info-view',
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './basic-info-view.html',
  styleUrl: './basic-info-view.css'
})
export class BasicInfoView {
  @Input() initialData!: Hotel;
  @Output() dataUpdated = new EventEmitter<Partial<Hotel>>();

  isEditing = false;
  basicInfoForm!: FormGroup;
  hotelTypes = ['HOTEL', 'APARTMENT', 'VILLA', 'RESORT', 'COTTAGE', 'CABIN', 'GUEST HOUSE', 'HOSTEL', 'PALACE'];

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.initForm();
  }

  initForm(): void {
    this.basicInfoForm = this.fb.group({
      name: [this.initialData.name, Validators.required],
      description: [this.initialData.description, Validators.required],
      type: [this.initialData.type || '', Validators.required],
    });
  }

  onEdit(): void {
    this.isEditing = true;
  }

  onCancel(): void {
    this.isEditing = false;
    this.basicInfoForm.patchValue(this.initialData);
  }

  onSave(): void {
    if (this.basicInfoForm.valid) {
      this.dataUpdated.emit(this.basicInfoForm.value);
      this.isEditing = false;
    }
  }
}
