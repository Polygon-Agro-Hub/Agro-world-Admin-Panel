import { TestBed } from '@angular/core/testing';

import { SalesAgentsService } from './sales-agents.service';

describe('SalesAgentsService', () => {
  let service: SalesAgentsService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SalesAgentsService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
