import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturesAmenities } from './features-amenities';

describe('FeaturesAmenities', () => {
  let component: FeaturesAmenities;
  let fixture: ComponentFixture<FeaturesAmenities>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturesAmenities]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeaturesAmenities);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
