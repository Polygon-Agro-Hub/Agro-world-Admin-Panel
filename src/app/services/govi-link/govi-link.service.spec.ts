import { TestBed } from '@angular/core/testing';

import { GoviLinkService } from './govi-link.service';

describe('GoviLinkService', () => {
  let service: GoviLinkService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(GoviLinkService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
