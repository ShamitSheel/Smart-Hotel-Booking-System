import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RoomsViewComponent } from './rooms-view';

describe('RoomsView', () => {
  let component: RoomsViewComponent;
  let fixture: ComponentFixture<RoomsViewComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RoomsViewComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RoomsViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
