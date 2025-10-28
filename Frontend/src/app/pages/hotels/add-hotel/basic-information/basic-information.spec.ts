import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BasicInformation } from './basic-information';

describe('BasicInformation', () => {
  let component: BasicInformation;
  let fixture: ComponentFixture<BasicInformation>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BasicInformation]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BasicInformation);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
