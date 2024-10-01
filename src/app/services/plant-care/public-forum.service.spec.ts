import { TestBed } from '@angular/core/testing';

import { PublicForumService } from './public-forum.service';

describe('PublicForumService', () => {
  let service: PublicForumService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PublicForumService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
