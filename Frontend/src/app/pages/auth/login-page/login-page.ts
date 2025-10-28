import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth-service';
import { User } from '../../../core/models/user.models'; 
import { take } from 'rxjs'; 

@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './login-page.html',
  styleUrls: ['./login-page.css']
})
export class LoginPage {
  email: string = '';
  password: string = '';
  role: 'user' | 'admin' = 'user';
  loginError: string = ''; // New property to display login errors

  constructor(private authService: AuthService, private router: Router) {}

  toggleRole(selectedRole: 'user' | 'admin'): void {
    this.role = selectedRole;
    this.loginError = ''; // Clear previous errors when toggling
  }

  login(): void {
    this.loginError = ''; // Clear previous errors

    if (!this.email || !this.password) {
      this.loginError = 'Please enter both email/username and password.';
      return;
    }

    // Call the updated AuthService method
    this.authService.login({ email: this.email, password: this.password }).subscribe({
      next: (response) => {
        if (response.success && response.user) {
          console.log('Login successful');
          
          // ROLE-BASED NAVIGATION: The backend is the source of truth for the role.
          if ((response.user?.role)?.toLocaleLowerCase() === "admin") {
            this.router.navigate(['/admin']);
          } else {
            this.router.navigate(['/']);
          }
        } else {
          console.error('Login failed:', response.message);
          this.loginError = response.message || 'Invalid email or password.';
        }
      },
      error: (err) => {
        // This would catch network errors, etc.
        console.error('A network or unexpected error occurred:', err);
        this.loginError = 'An unexpected error occurred. Please try again.';
      }
    });
  }

  forgotPassword(): void {
    console.log('Redirecting to forgot password page...');
    this.router.navigate(['/forgot-password']);
  }
}