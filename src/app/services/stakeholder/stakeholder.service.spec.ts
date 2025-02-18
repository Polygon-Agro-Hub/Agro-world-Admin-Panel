import { TestBed } from '@angular/core/testing';

import { StakeholderService } from './stakeholder.service';

describe('StakeholderService', () => {
  let service: StakeholderService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(StakeholderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
