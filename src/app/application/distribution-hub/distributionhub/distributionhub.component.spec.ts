import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistributionhubComponent } from './distributionhub.component';

describe('DistributionhubComponent', () => {
  let component: DistributionhubComponent;
  let fixture: ComponentFixture<DistributionhubComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DistributionhubComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DistributionhubComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
