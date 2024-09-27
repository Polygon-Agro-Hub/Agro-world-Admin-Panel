import { TestBed } from '@angular/core/testing';

import { PlantcareUsersService } from './plantcare-users.service';

describe('PlantcareUsersService', () => {
  let service: PlantcareUsersService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(PlantcareUsersService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
