import { TestBed } from '@angular/core/testing';

import { FarmerPensionService } from './farmer-pension.service';

describe('FarmerPensionService', () => {
  let service: FarmerPensionService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FarmerPensionService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
