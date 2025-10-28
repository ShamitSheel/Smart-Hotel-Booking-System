import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotelSearchCards } from './hotel-search-cards';

describe('HotelSearchCards', () => {
  let component: HotelSearchCards;
  let fixture: ComponentFixture<HotelSearchCards>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotelSearchCards]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HotelSearchCards);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
