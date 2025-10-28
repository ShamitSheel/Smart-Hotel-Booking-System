export interface Review {
  id: string;
  userId: string;
  hotelId: string;
  bookingId: string; // Added for backend compatibility
  rating: number;
  comment: string;
  timestamp: string;
  reviewerName?: string; 
  hotelResponse?: string; 
}

export interface AverageRatingResponse {
  hotelId: string;
  averageRating: number;
  reviewCount: number;
}

export interface ReviewRequest {
  hotelId: string;
  bookingId: string;
  rating: number;
  comment: string;
  reviewerName?: string;
}
