import { Routes } from '@angular/router';
import { HomePage } from './pages/home/home-page/home-page';
import { SearchResultComponent } from './pages/search-results/search-result-component/search-result-component';
import { HotelDetailsComponent } from './pages/hotel-details/hotel-details-component/hotel-details-component';
import { BookingForm } from './pages/booking/booking-form/booking-form';
import { MyBooking } from './pages/mybookings/my-booking/my-booking';
import { ProfilePage } from './pages/profile/profile-page/profile-page';
import { LoginPage } from './pages/auth/login-page/login-page';
import { RegistrationPage } from './pages/auth/registration-page/registration-page';

// Admin Components
import { AdminHotelListComponent } from './pages/admin-dashboard/admin-hotel-list/admin-hotel-list';
import { AdminHotelDetails } from './pages/admin-dashboard/admin-hotel-details/admin-hotel-details';
import { AdminBookingsComponent } from './pages/admin-dashboard/admin-bookings/admin-bookings';
import { AddHotelPageComponent } from './pages/hotels/add-hotel/add-hotel-page/add-hotel-page';

// Guards
import { AdminGuard } from './core/guards/admin.guard-guard';
import { AuthGuard } from './core/guards/auth-guard-guard';
import { ManagerDashboardComponent } from './pages/admin-dashboard/manager-dashboard/manager-dashboard';


export const routes: Routes = [

  // PUBLIC ROUTES
  { path: '', component: HomePage },
  { path: 'results', component: SearchResultComponent },
  { path: 'search-results', component: SearchResultComponent },
  { path: 'hotel-details/:id', component: HotelDetailsComponent },
  { path: 'login', component: LoginPage },
  { path: 'register', component: RegistrationPage },

  // USER-SPECIFIC ROUTES
  // These routes are for a logged-in general user
  { path: 'bookings', component: MyBooking, canActivate: [AuthGuard] },
  { path: 'profile', component: ProfilePage },
  { path: 'book-room/:roomId/:hotelId', component: BookingForm, canActivate: [AuthGuard] },

  // ADMIN-SPECIFIC ROUTES (PROTECTED)
  // These routes require the user to have the 'admin' role
  { 
    path: 'add-hotel',
    component: AddHotelPageComponent,
    canActivate: [AdminGuard] 
  },
  
  {
    path: 'admin',
    canActivate: [AdminGuard],
    children: [
      { path: 'add', component: AddHotelPageComponent, canActivate: [AdminGuard]},
      { path: '', component: ManagerDashboardComponent, pathMatch: 'full' },
      { path: 'dashboard', redirectTo: '' },

    
      { path: 'hotels', component: AdminHotelListComponent },
      { path: 'hotels/:id', component: AdminHotelDetails },


      { path: 'bookings', component: AdminBookingsComponent }
    ]
  },

  // WILDCARD ROUTE
  // Must be the last route in the array redirects to home for any invalid url
  { path: '**', redirectTo: '' }

];