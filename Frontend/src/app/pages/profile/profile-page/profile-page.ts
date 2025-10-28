import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { AuthService } from '../../../core/services/auth-service';
import { take } from 'rxjs/operators';
import { Router } from '@angular/router';
// Import the actual User model from your core models folder
import { User } from '../../../core/models/user.models';
import { RouterLink } from '@angular/router'; 

// --- FIX 1: Remove the local duplicate interface and use the imported one (User) ---

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './profile-page.html',
  styleUrl: './profile-page.css'
})
export class ProfilePage implements OnInit {
  isEditMode = false;
  showPasswordForm = false;

  // Initialize profile with a valid empty structure of the imported User type
  profile: User = {
    id: '',
    username: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    // This must match the strict type from user.models.ts, assuming 'user' is the default
    role: 'user', 
    loyaltyPoints: 0 
  } as User; 

  // --- FIX 2: TS2564 Error Fix ---
  // Declare it as possibly null OR initialize it in the constructor. 
  // Since it's only set in ngOnInit, declaring it as possibly null is safer.
  originalProfile: User | null = null; 

  passwordForm = {
    oldPassword: '',
    newPassword: '',
    confirmPassword: ''
  };

  constructor(private authService: AuthService, private router: Router) {}

  ngOnInit(): void {
    this.authService.currentUser$.subscribe(user => {
      if (user) {
        // user is of type User, so this assignment is now type-safe
        this.profile = { ...user };
        this.originalProfile = { ...user };
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  toggleEdit() {
    this.isEditMode = !this.isEditMode;
    this.showPasswordForm = false;
    if (!this.isEditMode && this.originalProfile) { // Check if originalProfile is not null
      this.profile = { ...this.originalProfile };
    }
  }

  togglePasswordForm() {
    this.showPasswordForm = !this.showPasswordForm;
    this.isEditMode = false;
    this.passwordForm = { oldPassword: '', newPassword: '', confirmPassword: '' };
  }

  saveProfile(form: NgForm) {
    if (form.valid) {
      // The profile being passed is now explicitly of the imported User type,
      // resolving the TS2345 error.
      this.authService.updateProfile(this.profile).subscribe(
        response => {
          if (response.success) {
            // Update originalProfile only if it's successful
            this.originalProfile = { ...this.profile };
            this.isEditMode = false;
            alert('Profile saved successfully!');
          } else {
            alert('Failed to save profile: ' + response.message);
          }
        },
        () => {
          alert('An error occurred while saving the profile.');
        }
      );
    } else {
      alert('Please correct the errors in the form.');
    }
  }

  changePassword() {
    const { oldPassword, newPassword, confirmPassword } = this.passwordForm;

    if (!oldPassword || !newPassword || !confirmPassword) {
      alert('All password fields are required.');
      return;
    }

    if (newPassword !== confirmPassword) {
      alert('New password and confirm password do not match.');
      return;
    }

    this.authService.changePassword(oldPassword, newPassword, confirmPassword).subscribe(
      response => {
        if (response.success) {
          alert('Password changed successfully!');
          this.passwordForm = { oldPassword: '', newPassword: '', confirmPassword: '' };
          this.showPasswordForm = false;
        } else {
          alert('Failed to change password: ' + response.message);
        }
      },
      error => {
        console.error('Password change error:', error);
        alert('An error occurred while changing the password.');
      }
    );
  }
}