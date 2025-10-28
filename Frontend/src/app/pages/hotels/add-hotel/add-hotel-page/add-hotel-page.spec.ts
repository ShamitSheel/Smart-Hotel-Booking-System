import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddHotelPageComponent } from './add-hotel-page';

describe('AddHotelPage', () => {
  let component: AddHotelPageComponent;
  let fixture: ComponentFixture<AddHotelPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddHotelPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddHotelPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
