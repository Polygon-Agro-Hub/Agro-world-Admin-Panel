import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSalesDashComplaintsComponent } from './view-sales-dash-complaints.component';

describe('ViewSalesDashComplaintsComponent', () => {
  let component: ViewSalesDashComplaintsComponent;
  let fixture: ComponentFixture<ViewSalesDashComplaintsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewSalesDashComplaintsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewSalesDashComplaintsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
