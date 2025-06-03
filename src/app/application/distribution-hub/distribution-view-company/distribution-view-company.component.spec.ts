import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistributionViewCompanyComponent } from './distribution-view-company.component';

describe('DistributionViewCompanyComponent', () => {
  let component: DistributionViewCompanyComponent;
  let fixture: ComponentFixture<DistributionViewCompanyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DistributionViewCompanyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DistributionViewCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
