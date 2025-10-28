import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminHotelDetails } from './admin-hotel-details';

describe('AdminHotelDetails', () => {
  let component: AdminHotelDetails;
  let fixture: ComponentFixture<AdminHotelDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminHotelDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminHotelDetails);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
