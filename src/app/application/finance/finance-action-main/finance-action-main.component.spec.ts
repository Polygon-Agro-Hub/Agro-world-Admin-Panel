import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinanceActionMainComponent } from './finance-action-main.component';

describe('FinanceActionMainComponent', () => {
  let component: FinanceActionMainComponent;
  let fixture: ComponentFixture<FinanceActionMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinanceActionMainComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FinanceActionMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
