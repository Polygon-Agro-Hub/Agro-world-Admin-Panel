import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesDashDbComponent } from './sales-dash-db.component';

describe('SalesDashDbComponent', () => {
  let component: SalesDashDbComponent;
  let fixture: ComponentFixture<SalesDashDbComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesDashDbComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SalesDashDbComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
