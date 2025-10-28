import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, Validators, FormBuilder, AbstractControl, ValidationErrors } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../../core/services/auth-service';

// Custom validator to check if passwords match
export function passwordsMatchValidator(control: AbstractControl): ValidationErrors | null {
  const password = control.get('password');
  const confirmPassword = control.get('confirmPassword');

  if (password && confirmPassword && password.value !== confirmPassword.value) {
    // Set error on the form group itself
    return { mismatch: true };
  }

  return null;
}

@Component({
  selector: 'app-registration-page',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule, RouterModule],
  templateUrl: './registration-page.html',
})
export class RegistrationPage implements OnInit {
  registerForm!: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.registerForm = this.fb.group({
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      username: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(20)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required]], // Simplified validation for example
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]],
      // IMPORTANT: Set default role to match backend seeded data
      role: ['USER', [Validators.required]],
    }, { validators: passwordsMatchValidator });
  }

  // Method to update the role form control when the user clicks a button
  selectRole(role: 'USER' | 'ADMIN'): void {
    this.registerForm.get('role')?.setValue(role);
  }

  onSubmit(): void {
    if (this.registerForm.invalid) { return; }

    const { confirmPassword, ...userData } = this.registerForm.value;

    this.authService.register(userData).subscribe(response => {
      if (response.success) {
        console.log('Registration successful, user is now logged in.');
        // === THE FINAL CHANGE ===
        // Instead of navigating to login, navigate to the main app page!
        if((response.user?.role)?.toLocaleLowerCase() === "admin"){
          this.router.navigate(['/admin']);
        } else{
          this.router.navigate(['/']);
        }
         // Or '/home', or wherever your main content is
      } else {
        console.error('Registration failed:', response.message);
        alert(`Registration Failed: ${response.message}`);
      }
    });
  }
}