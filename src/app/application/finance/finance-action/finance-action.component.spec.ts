import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FinanceActionComponent } from './finance-action.component';

describe('FinanceActionComponent', () => {
  let component: FinanceActionComponent;
  let fixture: ComponentFixture<FinanceActionComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FinanceActionComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FinanceActionComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
