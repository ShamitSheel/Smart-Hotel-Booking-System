
import { Component, ViewChild, ElementRef, AfterViewInit, HostListener, OnDestroy, OnInit } from '@angular/core';
import { DiscoverCards, PopularCards, TopDealCards, UniqueCards } from '../../../core/models/home-cards-model';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { HomeCardService } from './../../../core/services/home-card-service';
import { Subscription, forkJoin, Observable, of } from 'rxjs'; 
import { switchMap, map, catchError } from 'rxjs/operators'; 
import { ReviewService } from '../../../core/services/review-service'; 

import { Review } from '../../../core/models/review.models';
interface CardWithReview {
    id: string;
    rating: number; 
    reviewCount?: number; 
}

@Component({
  selector: 'app-home-card-component',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home-card-component.html',
  styleUrls: ['./home-card-component.css']
})
export class HomeCardComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('propertyScroll') propertyScroll!: ElementRef;
  @ViewChild('popularScroll') popularScroll!: ElementRef;
  @ViewChild('homesScroll') homesScroll!: ElementRef;
  @ViewChild('dealsScroll') dealsScroll!: ElementRef;

  arrowVisibility = {
    property: { left: false, right: true },
    popular: { left: false, right: true },
    homes: { left: false, right: true },
    deals: { left: false, right: true },
  };

  propertyCards: DiscoverCards[] = [];
  cards: PopularCards[] = [];
  homesCards: UniqueCards[] = [];
  dealsCards: TopDealCards[] = [];

  private subscriptions = new Subscription();

  // Inject ReviewService
  constructor(private hotelService: HomeCardService, private reviewService: ReviewService, private router: Router) { } 

  ngOnInit(): void {
    // Static data subscriptions (Unchanged)
    this.subscriptions.add(
      this.hotelService.getDiscoverCards().subscribe(data => {
        this.propertyCards = data;
      })
    );

    this.subscriptions.add(
      this.hotelService.getPopularCards().subscribe(data => {
        this.cards = data;
      })
    );

    // Dynamic Data: Unique Stays (Refactored using the search component's pattern)
    this.subscriptions.add(
      this.fetchCardsWithReviews<UniqueCards>(this.hotelService.getUniqueCards())
          .subscribe(data => {
            this.homesCards = data;
          })
    );

    // Dynamic Data: Top Deals (Refactored using the search component's pattern)
    this.subscriptions.add(
      this.fetchCardsWithReviews<TopDealCards>(this.hotelService.getTopDealCards())
          .subscribe(data => {
            this.dealsCards = data;
          })
    );
  }

  /**
   * Helper function to fetch initial card data and then augment it with
   * live average rating and count from the Review Microservice.
   * Uses generics <T> to work with both UniqueCards and TopDealCards.
   */
  private fetchCardsWithReviews<T extends CardWithReview>(
      cardObservable: Observable<T[]>
  ): Observable<T[]> {
      // 1. Get the list of cards
      return cardObservable.pipe(
          // 2. Switch to the array of review observables
          switchMap(cards => {
              if (!cards || cards.length === 0) {
                  return of([] as T[]); 
              }

              // Create an array of observables, one for each card's rating call
              const reviewObservables = cards.map(card => 
                  this.reviewService.getAverageRatingAndCount(card.id)
                      .pipe(
                          // Map the rating response back into the original card object
                          map(reviewData => ({
                              ...card,
                              // Use the live average rating, rounded to one decimal place
                              rating: parseFloat(reviewData.averageRating.toFixed(1)) || 0,
                              reviewCount: reviewData.reviewCount || 0 // Use the live count
                          } as T)),
                          // On error (e.g., review service down), return card with default values
                          catchError(() => of({ ...card, rating: 0, reviewCount: 0 } as T))
                      )
              );

              // 3. Use forkJoin to wait for all the rating observables to complete in parallel
              return forkJoin(reviewObservables);
          })
      );
  }

  ngAfterViewInit(): void {
    setTimeout(() => {
      this.updatePropertyArrows();
      this.updatePopularArrows();
      this.updateHomesArrows();
      this.updateDealsArrows();
    }, 0);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  @HostListener('window:resize')
  onResize() {
    this.updatePropertyArrows();
    this.updatePopularArrows();
    this.updateHomesArrows();
    this.updateDealsArrows();
  }

  private scrollSection(ref: ElementRef, direction: 'left' | 'right') {
    const container = ref.nativeElement;
    const scrollAmount = container.clientWidth * 0.8;
    container.scrollBy({ left: direction === 'left' ? -scrollAmount : scrollAmount, behavior: 'smooth' });
  }

  scrollProperty(direction: 'left' | 'right') {
    this.scrollSection(this.propertyScroll, direction);
  }

  scrollPopular(direction: 'left' | 'right') {
    this.scrollSection(this.popularScroll, direction);
  }

  scrollHomes(direction: 'left' | 'right') {
    this.scrollSection(this.homesScroll, direction);
  }

  scrollDeals(direction: 'left' | 'right') {
    this.scrollSection(this.dealsScroll, direction);
  }

  private updateArrowVisibility(ref: ElementRef, section: keyof typeof this.arrowVisibility) {
    if (!ref || !ref.nativeElement) return;
    const container = ref.nativeElement;
    const scrollLeft = container.scrollLeft;
    const scrollWidth = container.scrollWidth;
    const clientWidth = container.clientWidth;

    this.arrowVisibility[section].left = scrollLeft > 0;
    this.arrowVisibility[section].right = scrollLeft + clientWidth < scrollWidth - 1;
  }

  updatePropertyArrows() {
    this.updateArrowVisibility(this.propertyScroll, 'property');
  }

  updatePopularArrows() {
    this.updateArrowVisibility(this.popularScroll, 'popular');
  }

  updateHomesArrows() {
    this.updateArrowVisibility(this.homesScroll, 'homes');
  }

  updateDealsArrows() {
    this.updateArrowVisibility(this.dealsScroll, 'deals');
  }

  navigateToPropertyType(type: string): void {
    this.router.navigate(['/results'], { queryParams: { type: type } });
  }

  navigateToDestination(location: string): void {
    this.router.navigate(['/results'], { queryParams: { location: location } });
  }

  navigateToHotelDetails(hotelId: string): void {
    this.router.navigate(['/hotel-details', hotelId]);
  }

  navigateToLocation(location: string, id: string | null = null): void {
    const queryParams: any = {};
    if (location) {
      queryParams.location = location;
    }
    if (id) {
      queryParams.id = id;
    }
    this.router.navigate(['/results'], { queryParams });
  }

  getRatingText(rating: number): string {
    if (rating >= 4.5) {
      return 'Excellent';
    }
    if (rating >= 4.0) {
      return 'Recommended';
    }
    if (rating >= 3.5) {
      return 'Good';
    }
    return 'Rated';
  }
  
}