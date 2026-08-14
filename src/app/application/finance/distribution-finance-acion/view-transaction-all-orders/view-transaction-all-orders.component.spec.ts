import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewTransactionAllOrdersComponent } from './view-transaction-all-orders.component';

describe('ViewTransactionAllOrdersComponent', () => {
  let component: ViewTransactionAllOrdersComponent;
  let fixture: ComponentFixture<ViewTransactionAllOrdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewTransactionAllOrdersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewTransactionAllOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
