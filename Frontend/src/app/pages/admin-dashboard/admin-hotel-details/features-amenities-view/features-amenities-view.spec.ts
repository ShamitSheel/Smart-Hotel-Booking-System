import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FeaturesAmenitiesView } from './features-amenities-view';

describe('FeaturesAmenitiesView', () => {
  let component: FeaturesAmenitiesView;
  let fixture: ComponentFixture<FeaturesAmenitiesView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeaturesAmenitiesView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FeaturesAmenitiesView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
