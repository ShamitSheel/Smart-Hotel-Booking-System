import { Injectable } from '@angular/core';
import { HttpClient, HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { forkJoin, Observable, of } from 'rxjs';
import { catchError, delay, map, switchMap } from 'rxjs/operators';
import { Hotel } from '../models/hotel.model';

@Injectable({
  providedIn: 'root'
})
export class HotelListingService {
  private apiUrl = 'https://hotelify-api-gateway.onrender.com/api/hotels';

  // WARNING: EXTREME SECURITY RISK. DO NOT USE IN PRODUCTION.
  // This token should NEVER be hardcoded in the frontend.
  private githubToken = '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';
  private githubRepoOwner = 'AdityaGoraneCTS';
  private githubRepoName = 'HotelifyImages';
  private imagesPath = 'images'; // The folder where you want to store images in the repo

  constructor(private http: HttpClient) { }

  saveHotel(hotelData: Hotel): Observable<Hotel> {
    return this.http.post<Hotel>(this.apiUrl, hotelData);
  }


  getAllHotels(): Observable<Hotel[]> {
    return this.http.get<Hotel[]>(this.apiUrl);
  }

  // getHotelsByManagerId(managerId: string): Observable<Hotel[]> {
  //   return this.http.get<Hotel[]>(`${this.apiUrl}?managerId=${managerId}`);
  // }

  // AFTER (Correct URL)
  getHotelsByManagerId(managerId: string): Observable<Hotel[]> {
    // Use a path variable '/manager/' instead of a query parameter '?managerId='
    return this.http.get<Hotel[]>(`${this.apiUrl}/manager/${managerId}`);
  }

  getHotelById(id: string): Observable<Hotel> {
    return this.http.get<Hotel>(`${this.apiUrl}/${id}`);
  }

  updateHotelBasicInfo(id: string, basicInfoData: { name: string; description: string; type: string; }): Observable<Hotel> {
    // This method calls the specific .../{id}/basic-info endpoint
    return this.http.patch<Hotel>(`${this.apiUrl}/${id}/basic-info`, basicInfoData);
  }

  updateHotelContactAddress(id: string, contactAddressData: { address: any; contact: any; }): Observable<Hotel> {
    // This method calls the specific .../{id}/contact-address endpoint
    return this.http.patch<Hotel>(`${this.apiUrl}/${id}/contact-and-address`, contactAddressData);
  }

  updateHotelImages(id: string, imagesData: { images: string[]; primaryImage?: string; }): Observable<Hotel> {
    // This method calls the specific .../{id}/images endpoint
    return this.http.patch<Hotel>(`${this.apiUrl}/${id}/images`, imagesData);
  }

  updateHotelFeaturesAmenities(id: string, data: { features: string[]; amenities: string[]; }): Observable<Hotel> {
    return this.http.patch<Hotel>(`${this.apiUrl}/${id}/features-and-amenities`, data);
  }

  updateHotelPolicies(id: string, data: { policies: any; isFullyRefundable: boolean; hasFreeBreakfast: boolean; reserveNowPayLater: boolean; }): Observable<Hotel> {
    return this.http.patch<Hotel>(`${this.apiUrl}/${id}/policies`, data);
  }

  updateHotel(id: string, updatedData: Partial<Hotel>): Observable<Hotel> {
    return this.http.patch<Hotel>(`${this.apiUrl}/${id}`, updatedData);
  }

  updateHotelRooms(id: string, roomUpdates: any[]): Observable<Hotel> {
    console.log('Sending room updates:', roomUpdates);
    return this.http.patch<Hotel>(`${this.apiUrl}/${id}/rooms`, roomUpdates);
  }


  deleteHotel(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  

  /**
   * Helper function to convert a File object to a Base64 encoded string.
   * @param file The file to encode.
   * @returns An Observable of the Base64 string.
   */
  private getBase64(file: File): Observable<string> {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    return new Observable(observer => {
      reader.onload = () => {
        // Extract the Base64 string from the data URL
        const base64String = (reader.result as string).split(',')[1];
        observer.next(base64String);
        observer.complete();
      };
      reader.onerror = error => observer.error(error);
    });
  }

  /**
   * Uploads multiple image files to a GitHub repository. Handles both new files and updates to existing ones.
   * @param files The array of File objects to upload.
   * @returns An Observable of an array of image URLs.
   */
  // uploadImages(files: File[]): Observable<string[]> {
  //   if (files.length === 0) {
  //     return of([]);
  //   }

  //   const headers = new HttpHeaders({
  //     'Authorization': `token ${this.githubToken}`,
  //     'Content-Type': 'application/json'
  //   });

  //   const uploadObservables = files.map(file => {
  //     const fileName = file.name.replace(/ /g, '_'); // Replace spaces with underscores
  //     const filePath = `${this.imagesPath}/${fileName}`;
  //     const fileUrl = `https://api.github.com/repos/${this.githubRepoOwner}/${this.githubRepoName}/contents/${filePath}`;

  //     // Step 1: Check if the file exists and get its SHA
  //     return this.http.get<any>(fileUrl, { headers }).pipe(
  //       catchError((error: HttpErrorResponse) => {
  //         // If file doesn't exist (404), return null to indicate a new file.
  //         if (error.status === 404) {
  //           return of(null);
  //         }
  //         // For any other error, re-throw to be caught by the calling function.
  //         return of(null);
  //       }),
  //       switchMap(existingFile => {
  //         // Step 2: Upload or update the file
  //         return this.getBase64(file).pipe(
  //           switchMap(base64Content => {
  //             const body: any = {
  //               message: `feat: Upload image ${fileName}`,
  //               content: base64Content
  //             };
  //             // If the file exists, add the SHA to the request body
  //             if (existingFile) {
  //               body.sha = existingFile.sha;
  //               body.message = `fix: Update existing image ${fileName}`;
  //             }

  //             return this.http.put<any>(fileUrl, body, { headers });
  //           }),
  //           map(response => {
  //             // Construct the raw URL for the uploaded image
  //             return `https://raw.githubusercontent.com/${this.githubRepoOwner}/${this.githubRepoName}/main/${this.imagesPath}/${fileName}`;
  //           })
  //         );
  //       })
  //     );
  //   });

  //   return forkJoin(uploadObservables);
  // }

  uploadImages(files: File[]): Observable<string[]> {
    console.log('Simulating image upload for files:', files.map(f => f.name));
    const mockUrls = files.map((file, index) =>
      `https://example.com/images/hotel-${Date.now()}/${index}-${file.name}`
    );
    return of(mockUrls).pipe(delay(1500));
  }
}