import { Component, signal } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router'; // Import Router
import { CommonModule } from '@angular/common'; // Import CommonModule for ngIf

import { Navbar } from "./shared/components/navbar/navbar";
import { Footer } from "./shared/components/footer/footer";
import { AdminNavbarComponent } from './shared/components/admin-navbar/admin-navbar';


@Component({
  selector: 'app-root',
  standalone: true, // Assuming this is a standalone component
  imports: [RouterOutlet, CommonModule, Navbar, AdminNavbarComponent, Footer], // Add CommonModule here for ngIf
  templateUrl: './app.html',
  styleUrl: './app.css'
})

export class App {
  protected readonly title = signal('Hotelify');

  // Inject the Router service and make it public
  constructor(public router: Router) { }
}