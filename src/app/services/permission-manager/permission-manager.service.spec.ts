import { TestBed } from '@angular/core/testing';

import { PermissionManagerService } from './permission-manager.service';

describe('PermissionManagerService', () => {
  let service: PermissionManagerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PermissionManagerService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
