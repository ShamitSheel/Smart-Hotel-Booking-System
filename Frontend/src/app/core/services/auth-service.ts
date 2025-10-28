import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { tap, catchError, map } from 'rxjs/operators';
import { User, AuthResponse, BackendAuthResponse } from '../models/user.models';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = 'http://localhost:8000/api/users';
  
  private _isLoggedIn = new BehaviorSubject<boolean>(false);
  isLoggedIn$ = this._isLoggedIn.asObservable();
  private _currentUser = new BehaviorSubject<User | null>(null);
  currentUser$ = this._currentUser.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.checkInitialAuthStatus();
  }

  private checkInitialAuthStatus(): void {
    const token = localStorage.getItem('authToken');
    const userData = localStorage.getItem('currentUser');
    if (token && userData) {
      try {
        const storedUser = JSON.parse(userData);
        const { password, ...userWithoutPassword } = storedUser;
        this.setAuthData(token, userWithoutPassword);
      } catch (e) {
        console.error('Failed to parse user data from localStorage', e);
        this.clearAuthData();
      }
    }
  }

  private setAuthData(token: string, user: Omit<User, 'password'>): void {
    localStorage.setItem('authToken', token);
    localStorage.setItem('currentUser', JSON.stringify(user));
    this._isLoggedIn.next(true);
    this._currentUser.next(user as User);
  }

  private clearAuthData(): void {
    localStorage.removeItem('currentUser');
    this._isLoggedIn.next(false);
    this._currentUser.next(null);
  }

  public getCurrentUser(): User | null {
    return this._currentUser.getValue();
  }

  login(credentials: { email: string, password: string }): Observable<AuthResponse> {
    const loginPayload = {
      username: credentials.email,
      password: credentials.password
    };

    return this.http.post<BackendAuthResponse>(`${this.apiUrl}/login`, loginPayload).pipe(
      tap(response => {
        const { password, ...userWithoutPassword } = response.user;
        this.setAuthData(response.jwtToken, userWithoutPassword);
      }),
      map(response => ({
        success: true,
        message: 'Login successful',
        user: response.user
      })),
      catchError(this.handleError)
    );
  }

  register(userData: Omit<User, 'id'>): Observable<AuthResponse> {
    return this.http.post<BackendAuthResponse>(`${this.apiUrl}/register`, userData).pipe(
      tap(response => {
        const { password, ...userWithoutPassword } = response.user;
        this.setAuthData(response.jwtToken, userWithoutPassword);
      }),
      map(response => ({
        success: true,
        message: 'Registration successful! Welcome!',
        user: response.user
      })),
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An unknown server error occurred.';
        if (error.status === 409) {
          errorMessage = error.error?.message || 'Email or username already exists.';
        }
        console.error('Registration error', error);
        return of({ success: false, message: errorMessage });
      })
    );
  }

  logout(): void {
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    this._isLoggedIn.next(false);
    this._currentUser.next(null);
    this.router.navigate(['/login']);
  }

  updateProfile(updatedUser: User): Observable<AuthResponse> {
    const userId = this._currentUser.value?.id;
    if (!userId) {
      return of({ success: false, message: 'User not logged in' });
    }

    const { password, ...userUpdateData } = updatedUser;

    return this.http.patch<User>(`${this.apiUrl}/${userId}`, userUpdateData).pipe(
      tap(response => {
        const { password, ...userWithoutPassword } = response;
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        this._currentUser.next(userWithoutPassword as User);
      }),
      map(() => ({ success: true, message: 'Profile updated successfully' })),
      catchError(error => {
        console.error('Update profile error', error);
        let errorMessage = 'Server error';
        if (error.status === 400) {
            errorMessage = error.error?.message || 'Invalid data provided';
        } else if (error.status === 404) {
            errorMessage = 'User not found';
        } else if (error.status === 403) {
            errorMessage = 'Access denied. Please log in again.';
        }
        return of({ success: false, message: errorMessage });
      })
    );
  }

  changePassword(oldPassword: string, newPassword: string, confirmPassword: string): Observable<AuthResponse> {
    const userId = this._currentUser.value?.id;
    if (!userId) {
      return of({ success: false, message: 'User not logged in' });
    }

    const passwordData = {
      oldPassword,
      newPassword,
      confirmPassword
    };

    return this.http.put(`${this.apiUrl}/${userId}/change-password`, passwordData, { responseType: 'text' }).pipe(
      map(() => ({ success: true, message: 'Password changed successfully' })),
      catchError(error => {
        console.error('Change password error', error);
        let errorMessage = 'Server error';
        
        if (error.status === 200) {
           return of({ success: true, message: 'Password changed successfully' });
        }
        
        if (error.status === 400) {
          errorMessage = error.error || 'Invalid password data provided.';
        }
        
        return of({ success: false, message: errorMessage });
      })
    );
  }

  /**
   * Updates loyalty points using the dedicated backend endpoint
   */
  updateLoyaltyPoints(userId: string, newPoints: number): Observable<AuthResponse> {
    return this.http.patch<User>(`${this.apiUrl}/${userId}/loyalty-points`, { loyaltyPoints: newPoints }).pipe(
      tap(response => {
        const { password, ...userWithoutPassword } = response;
        localStorage.setItem('currentUser', JSON.stringify(userWithoutPassword));
        this._currentUser.next(userWithoutPassword as User);
      }),
      map(() => ({ success: true, message: 'Loyalty points updated successfully' })),
      catchError(error => {
        console.error('Failed to update loyalty points', error);
        return of({ success: false, message: 'Failed to update loyalty points' });
      })
    );
  }

  private handleError(error: HttpErrorResponse): Observable<AuthResponse> {
    const errorMessage = error.error?.message || 'Invalid username or password.';
    console.error(`Login failed: ${error.status}`, error.error);
    return of({ success: false, message: errorMessage });
  }
}
