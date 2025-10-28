import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationContactView } from './location-contact-view';

describe('LocationContactView', () => {
  let component: LocationContactView;
  let fixture: ComponentFixture<LocationContactView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationContactView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocationContactView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
