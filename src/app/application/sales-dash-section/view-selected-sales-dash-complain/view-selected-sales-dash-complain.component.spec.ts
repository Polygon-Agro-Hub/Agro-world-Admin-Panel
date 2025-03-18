import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewSelectedSalesDashComplainComponent } from './view-selected-sales-dash-complain.component';

describe('ViewSelectedSalesDashComplainComponent', () => {
  let component: ViewSelectedSalesDashComplainComponent;
  let fixture: ComponentFixture<ViewSelectedSalesDashComplainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewSelectedSalesDashComplainComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewSelectedSalesDashComplainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
