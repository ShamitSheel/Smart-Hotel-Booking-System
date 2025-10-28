import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LocationContact } from './location-contact';

describe('LocationContact', () => {
  let component: LocationContact;
  let fixture: ComponentFixture<LocationContact>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LocationContact]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LocationContact);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
