import { TestBed } from '@angular/core/testing';

import { RoleSelectionService } from './role-selection.service';

describe('RoleSelectionService', () => {
  let service: RoleSelectionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(RoleSelectionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
