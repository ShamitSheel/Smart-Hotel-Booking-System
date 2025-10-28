import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReviewSubmit } from './review-submit';

describe('ReviewSubmit', () => {
  let component: ReviewSubmit;
  let fixture: ComponentFixture<ReviewSubmit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReviewSubmit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReviewSubmit);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
