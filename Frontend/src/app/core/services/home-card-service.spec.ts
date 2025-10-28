import { TestBed } from '@angular/core/testing';

import { HomeCardService } from './home-card-service';

describe('HomeCardService', () => {
  let service: HomeCardService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(HomeCardService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
