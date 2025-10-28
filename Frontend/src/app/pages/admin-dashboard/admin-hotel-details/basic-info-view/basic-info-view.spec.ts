import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicInfoView } from './basic-info-view';

describe('BasicInfoView', () => {
  let component: BasicInfoView;
  let fixture: ComponentFixture<BasicInfoView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasicInfoView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BasicInfoView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
