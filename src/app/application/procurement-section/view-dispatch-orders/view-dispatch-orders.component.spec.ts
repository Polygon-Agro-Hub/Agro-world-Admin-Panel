import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewDispatchOrdersComponent } from './view-dispatch-orders.component';

describe('ViewDispatchOrdersComponent', () => {
  let component: ViewDispatchOrdersComponent;
  let fixture: ComponentFixture<ViewDispatchOrdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewDispatchOrdersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewDispatchOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
