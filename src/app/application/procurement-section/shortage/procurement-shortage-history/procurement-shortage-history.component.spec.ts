import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcurementShortageHistoryComponent } from './procurement-shortage-history.component';

describe('ProcurementShortageHistoryComponent', () => {
  let component: ProcurementShortageHistoryComponent;
  let fixture: ComponentFixture<ProcurementShortageHistoryComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcurementShortageHistoryComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProcurementShortageHistoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
