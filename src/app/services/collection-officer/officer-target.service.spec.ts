import { TestBed } from '@angular/core/testing';

import { OfficerTargetService } from './officer-target.service';

describe('OfficerTargetService', () => {
  let service: OfficerTargetService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(OfficerTargetService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
