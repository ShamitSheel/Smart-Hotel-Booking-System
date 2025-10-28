import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-confirmation-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './confirmation-modal.html',
  styleUrls: ['./confirmation-modal.css']
})
export class ConfirmationModalComponent {
  @Input() promptText = 'Are you sure you want to proceed?';
  @Input() confirmationText = 'DELETE';
  @Output() confirmed = new EventEmitter<boolean>();

  userInput = '';

  get isInputCorrect(): boolean {
    return this.userInput === this.confirmationText;
  }

  onConfirm(): void {
    if (this.isInputCorrect) {
      this.confirmed.emit(true);
    }
  }

  onCancel(): void {
    this.confirmed.emit(false);
  }
}