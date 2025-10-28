// Updated HomeCardService.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { DiscoverCards, PopularCards, TopDealCards, UniqueCards } from '../models/home-cards-model';

@Injectable({
  providedIn: 'root'
})
export class HomeCardService {
  
  private apiUrl = 'http://localhost:8000/api/hotels';

  constructor(private http: HttpClient) {}

  // --- STATIC DATA: DISCOVER CARDS ---
  getDiscoverCards(): Observable<DiscoverCards[]> {
    const staticData: DiscoverCards[] = [
      { id: '1', title: 'HOTELS', type: 'HOTEL', image: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?q=80&w=1949&auto=format&fi" },
      { id: '2', title: 'APARTMENTS', type: 'APARTMENT', image: "https://images.trvl-media.com/lodging/1000000/700000/694800/694766/0f763fcc.jpg?impolicy=resizecrop" },
      { id: '3', title: 'VILLAS', type: 'VILLA', image: "https://images.trvl-media.com/lodging/20000000/19460000/19458500/19458493/8cf0d468.jpg?impolicy=res" },
      { id: '4', title: 'RESORTS', type: 'RESORT', image: "https://images.unsplash.com/photo-1571896349842-33c89424de2d?q=80&w=1780&auto=format&fi" },
      { id: '5', title: 'COTTAGES', type: 'COTTAGE', image: "https://images.trvl-media.com/lodging/113000000/112500000/112499100/112499097/829c512e.jpg?impolicy" },
      { id: '6', title: 'CABINS', type: 'CABIN', image: "https://images.unsplash.com/photo-1578683010236-d716f9a3f461?q=80&w=2070&auto=format&fi" },
      { id: '7', title: 'GUEST HOUSES', type: 'GUEST_HOUSE', image: "https://images.trvl-media.com/lodging/1000000/800000/791000/790963/1571c06e.jpg?impolicy=resizecrop" }
    ];
    return of(staticData);
  }

  // --- STATIC DATA: POPULAR CARDS ---
  getPopularCards(): Observable<PopularCards[]> {
    const staticData: PopularCards[] = [
      { id: '10', title: 'Chennai', image: "https://tse1.mm.bing.net/th/id/OIP.ByDADm1iPxKCQPZbvbYqSwHaFC?w=294&h=200&c=7&r=0&o" },
      { id: '11', title: 'Hyderabad', image: "https://cdn.budgetyourtrip.com/images/photos/headerphotos/large/india_hyderabad.jpg" },
      { id: '12', title: 'Mumbai', image: "https://tse3.mm.bing.net/th/id/OIP.ctjxLFlGySEbcYHrBxM48gHaEo?cb=12&rs=1&pid=ImgDetMain" },
      { id: '13', title: 'Bengaluru', image: "https://tse4.mm.bing.net/th/id/OIP.TEyH13ROxubdcv2H01WobAHaE8?cb=12&rs=1&pid=ImgDetMain" },
      { id: '14', title: 'Pune', image: "https://tse1.mm.bing.net/th/id/OIP.1zE3K_n6_-8W0EliBqZ1lAHaEK?cb=12&rs=1&pid=ImgDetMain" },
      { id: '15', title: 'Kolkata', image: "https://static2.tripoto.com/media/transfer/img/OgData/1500874108_victoria_memorial_hall_kolkata.jpg" },
      { id: '16', title: 'New Delhi', image: "https://cdn.britannica.com/37/189837-050-F0AF383E/New-Delhi-India-War-Memorial-arch-Sir.jpg" }
    ];
    return of(staticData);
  }

  // --- DYNAMIC DATA: UNIQUE CARDS ---
  getUniqueCards(): Observable<UniqueCards[]> {
    console.log('Fetching unique stays from:', `${this.apiUrl}/cards/unique-stays`);
    return this.http.get<any[]>(`${this.apiUrl}/cards/unique-stays`).pipe(
      map(hotels => {
        console.log('Unique stays response:', hotels);
        return hotels.map(hotel => ({
          id: hotel.id,
          title: hotel.name,
          hotelName: hotel.name,
          city: hotel.address?.city || '',
          rating: hotel.rating || 0,
          originalPrice: hotel.rooms?.[0]?.originalPrice || 0,
          offerPrice: hotel.rooms?.[0]?.discountedPrice || 0,
          image: hotel.images?.[0] || hotel.primaryImage || '',
          type: hotel.type
        }));
      }),
      catchError(error => {
        console.error('Error fetching unique stays:', error);
        return of([]);
      })
    );
  }

  // --- DYNAMIC DATA: TOP DEAL CARDS ---
  getTopDealCards(): Observable<TopDealCards[]> {
    console.log('Fetching top deals from:', `${this.apiUrl}/cards/top-deals`);
    return this.http.get<any[]>(`${this.apiUrl}/cards/top-deals`).pipe(
      map(hotels => {
        console.log('Top deals response:', hotels);
        return hotels.map(hotel => ({
          id: hotel.id,
          title: 'Top Deal',
          hotelName: hotel.name,
          city: hotel.address?.city || '',
          rating: hotel.rating || 0,
          originalPrice: hotel.rooms?.[0]?.originalPrice || 0,
          offerPrice: hotel.rooms?.[0]?.discountedPrice || 0,
          image: hotel.images?.[0] || hotel.primaryImage || '',
          type: hotel.type
        }));
      }),
      catchError(error => {
        console.error('Error fetching top deals:', error);
        return of([]);
      })
    );
  }
}
