import { TestBed } from '@angular/core/testing';

import { PlantcareDashbordService } from './plantcare-dashbord.service';

describe('PlantcareDashbordService', () => {
  let service: PlantcareDashbordService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlantcareDashbordService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
