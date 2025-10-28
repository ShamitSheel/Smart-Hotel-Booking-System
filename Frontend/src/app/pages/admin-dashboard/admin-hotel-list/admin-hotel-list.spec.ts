import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminHotelList } from './admin-hotel-list';

describe('AdminHotelList', () => {
  let component: AdminHotelList;
  let fixture: ComponentFixture<AdminHotelList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminHotelList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminHotelList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
