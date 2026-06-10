import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { Hotel } from '../models/hotel.model'; // Assuming the path is correct
import { map } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class HotelService {
  // Use the API Gateway base URL for the hotel microservice
  private apiUrl = 'https://hotelify-api-gateway.onrender.com/api/hotels';

  private http = inject(HttpClient);

  searchHotels(location: string | null = null, type: string | null = null): Observable<Hotel[]> {
    let params = new HttpParams();

    if (location) {
      params = params.set('location', location);
    }

    if (type) {
      params = params.set('type', type);
    }


    return this.http.get<Hotel[]>(`${this.apiUrl}/search`, { params });
  }


  // === UPDATED WRAPPER METHODS (to maintain compatibility with SearchResultComponent) ===

  searchHotelsByLocation(location: string): Observable<Hotel[]> {
    return this.searchHotels(location, null);
  }

  searchHotelsByType(type: string): Observable<Hotel[]> {
    return this.searchHotels(null, type);
  }

  getAllHotels(): Observable<Hotel[]> {
    return this.searchHotels(null, null);
  }

  getHotelById(id: string): Observable<Hotel> {
    // Correctly call the endpoint for a single hotel
    return this.http.get<Hotel>(`${this.apiUrl}/${id}`);
  }
}