import { ComponentFixture, TestBed } from '@angular/core/testing';

import { HotelPoliciesView } from './hotel-policies-view';

describe('HotelPoliciesView', () => {
  let component: HotelPoliciesView;
  let fixture: ComponentFixture<HotelPoliciesView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HotelPoliciesView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(HotelPoliciesView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
