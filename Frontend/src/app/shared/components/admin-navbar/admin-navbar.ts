import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router'; // Import Router for logout redirect
import { AuthService } from '../../../core/services/auth-service';
import { User } from '../../../core/models/user.models';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-admin-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './admin-navbar.html', // Point to the HTML file
  styleUrls: ['./admin-navbar.css'] // Point to the CSS file
})
export class AdminNavbarComponent implements OnInit, OnDestroy {
  userName: string = 'Manager';
  private userSubscription!: Subscription;

  constructor(
    private authService: AuthService,
    private router: Router // Inject Router
  ) { }

  ngOnInit(): void {
    // Subscribe to current user to display their first name
    this.userSubscription = this.authService.currentUser$.subscribe(user => {
      this.userName = user?.firstName || 'Manager';
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe to prevent memory leaks
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']); // Redirect to login page after logout
  }
}