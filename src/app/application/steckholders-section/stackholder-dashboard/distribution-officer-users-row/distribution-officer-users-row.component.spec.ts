import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistributionOfficerUsersRowComponent } from './distribution-officer-users-row.component';

describe('DistributionOfficerUsersRowComponent', () => {
  let component: DistributionOfficerUsersRowComponent;
  let fixture: ComponentFixture<DistributionOfficerUsersRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DistributionOfficerUsersRowComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DistributionOfficerUsersRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
