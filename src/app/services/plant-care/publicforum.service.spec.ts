import { TestBed } from '@angular/core/testing';

import { PublicforumService } from './publicforum.service';

describe('PublicforumService', () => {
  let service: PublicforumService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PublicforumService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
