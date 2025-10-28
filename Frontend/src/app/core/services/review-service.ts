import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Review, AverageRatingResponse, ReviewRequest } from '../models/review.models';
 
@Injectable({
  providedIn: 'root',
})
export class ReviewService {
  private reviewsUrl = 'http://localhost:8000/api/reviews';
 
  constructor(private http: HttpClient) {}
 
  submitReview(reviewData: ReviewRequest): Observable<Review> {
    return this.http.post<Review>(this.reviewsUrl, reviewData);
  }
 
  getReviewsByHotelId(hotelId: string): Observable<Review[]> {
    return this.http.get<Review[]>(`${this.reviewsUrl}/hotel/${hotelId}`);
  }
 
  getAverageRatingAndCount(hotelId: string): Observable<AverageRatingResponse> {
    return this.http.get<AverageRatingResponse>(`${this.reviewsUrl}/hotel/${hotelId}/average-rating`);
  }
}
