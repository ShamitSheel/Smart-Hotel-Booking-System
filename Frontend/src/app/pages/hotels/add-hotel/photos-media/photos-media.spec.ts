import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PhotosMedia } from './photos-media';

describe('PhotosMedia', () => {
  let component: PhotosMedia;
  let fixture: ComponentFixture<PhotosMedia>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PhotosMedia]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PhotosMedia);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
