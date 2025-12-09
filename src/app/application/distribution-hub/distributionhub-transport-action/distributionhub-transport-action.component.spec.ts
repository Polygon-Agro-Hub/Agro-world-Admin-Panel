import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DistributionhubTransportActionComponent } from './distributionhub-transport-action.component';

describe('DistributionhubTransportActionComponent', () => {
  let component: DistributionhubTransportActionComponent;
  let fixture: ComponentFixture<DistributionhubTransportActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DistributionhubTransportActionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DistributionhubTransportActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
