import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GoviTransViewTransactionsComponent } from './govi-trans-view-transactions.component';

describe('GoviTransViewTransactionsComponent', () => {
  let component: GoviTransViewTransactionsComponent;
  let fixture: ComponentFixture<GoviTransViewTransactionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GoviTransViewTransactionsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GoviTransViewTransactionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
