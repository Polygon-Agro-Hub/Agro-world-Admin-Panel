import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewWholesaleCustomersComponent } from './view-wholesale-customers.component';

describe('ViewWholesaleCustomersComponent', () => {
  let component: ViewWholesaleCustomersComponent;
  let fixture: ComponentFixture<ViewWholesaleCustomersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewWholesaleCustomersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewWholesaleCustomersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
