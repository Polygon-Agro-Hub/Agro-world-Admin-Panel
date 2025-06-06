import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewRetailOrdersComponent } from './view-retail-orders.component';

describe('ViewRetailOrdersComponent', () => {
  let component: ViewRetailOrdersComponent;
  let fixture: ComponentFixture<ViewRetailOrdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewRetailOrdersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewRetailOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
