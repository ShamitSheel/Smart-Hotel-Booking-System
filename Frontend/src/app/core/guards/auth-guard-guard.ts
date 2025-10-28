import { Injectable } from '@angular/core';
import { CanActivate, Router, UrlTree, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';
import { AuthService } from '../services/auth-service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  constructor(private authService: AuthService, private router: Router) {}

  canActivate(
    route: ActivatedRouteSnapshot,
    state: RouterStateSnapshot
  ): Observable<boolean | UrlTree> {
    return this.authService.currentUser$.pipe(
      take(1),
      map(user => {
        // If no user is logged in, redirect to the login page.
        if (!user) {
          return this.router.createUrlTree(['/login']);
        }

        // Check if the user's role is 'user'.
        if (user.role.toLocaleLowerCase() !== 'user') {
          // If the role is not 'user', redirect to a different page, like the home page.
          alert('You do not have the required permissions to access this page.');
          return this.router.createUrlTree(['/']);
        }

        // If a user is logged in and the role is 'user', allow navigation.
        return true;
      })
    );
  }
}