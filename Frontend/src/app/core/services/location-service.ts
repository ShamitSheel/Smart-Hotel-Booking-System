// import { Injectable } from '@angular/core';
// import { of } from 'rxjs';
// import { delay } from 'rxjs/operators';

// @Injectable({
//   providedIn: 'root'
// })
// export class LocationService {
//   private locations = [
//     'Chennai', 'Guindy', 'Anna Salai',
//     'Mumbai', 'Colaba',
//     'Hyderabad', 'Banjara Hills',
//     'Bengaluru', 'Ashok Nagar', 'New Delhi', 'Chanakyapuri',
//     'Jaipur', 'Goner Road', 'Goa', 'Candolim',
//     'Kolkata', 'Esplanade',
//     'Pune', 'Viman Nagar',
//     'Agra', 'Fatehabad Road',
//     'Udaipur', 'Lake Pichola'
//   ];

//   getLocationSuggestions(query: string) {
//     const filtered = this.locations.filter(loc =>
//       loc.toLowerCase().startsWith(query.toLowerCase())
//     );
//     return of(filtered).pipe(delay(200));
//   }
// }



import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { map } from 'rxjs/operators';

export interface Hotel {
  id: string;
  name: string;
  address: {
    city: string;
    area: string;
    state: string;
    country: string;
  };
  rating: number;
  primaryImage: string;
}

@Injectable({
  providedIn: 'root'
})
export class LocationService {
  private apiUrl = 'http://localhost:3000/hotels';

  constructor(private http: HttpClient) {}

  getLocationSuggestions(query: string): Observable<string[]> {
    if (!query || query.length < 2) {
      return of([]);
    }

    return this.http.get<Hotel[]>(`${this.apiUrl}/search?location=${encodeURIComponent(query)}`)
      .pipe(
        catchError(() => of([])),
        // Transform hotels to location suggestions
        map((hotels: Hotel[]) => {
          const suggestions = new Set<string>();
          hotels.forEach(hotel => {
            suggestions.add(hotel.name);
            suggestions.add(hotel.address.city);
            if (hotel.address.area) suggestions.add(hotel.address.area);
          });
          return Array.from(suggestions).slice(0, 10);
        })
      );
  }

  searchHotels(query: string): Observable<Hotel[]> {
    if (!query) {
      return of([]);
    }
    
    return this.http.get<Hotel[]>(`${this.apiUrl}/search?location=${encodeURIComponent(query)}`)
      .pipe(
        catchError(() => of([]))
      );
  }
}
