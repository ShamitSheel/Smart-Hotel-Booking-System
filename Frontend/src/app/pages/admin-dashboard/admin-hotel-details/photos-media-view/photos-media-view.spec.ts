import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotosMediaView } from './photos-media-view';

describe('PhotosMediaView', () => {
  let component: PhotosMediaView;
  let fixture: ComponentFixture<PhotosMediaView>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotosMediaView]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhotosMediaView);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
