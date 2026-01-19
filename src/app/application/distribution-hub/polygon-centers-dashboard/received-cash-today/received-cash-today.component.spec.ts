import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReceivedCashTodayComponent } from './received-cash-today.component';

describe('ReceivedCashTodayComponent', () => {
  let component: ReceivedCashTodayComponent;
  let fixture: ComponentFixture<ReceivedCashTodayComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReceivedCashTodayComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReceivedCashTodayComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
