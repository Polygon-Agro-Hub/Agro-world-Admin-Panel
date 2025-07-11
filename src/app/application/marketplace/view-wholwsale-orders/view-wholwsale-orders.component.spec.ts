import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewWholwsaleOrdersComponent } from './view-wholwsale-orders.component';

describe('ViewWholwsaleOrdersComponent', () => {
  let component: ViewWholwsaleOrdersComponent;
  let fixture: ComponentFixture<ViewWholwsaleOrdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewWholwsaleOrdersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewWholwsaleOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
