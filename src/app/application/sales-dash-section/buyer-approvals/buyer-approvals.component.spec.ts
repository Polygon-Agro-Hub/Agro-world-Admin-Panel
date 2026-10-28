import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyerApprovalsComponent } from './buyer-approvals.component';

describe('BuyerApprovalsComponent', () => {
  let component: BuyerApprovalsComponent;
  let fixture: ComponentFixture<BuyerApprovalsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuyerApprovalsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BuyerApprovalsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
