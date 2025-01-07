import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesDashComponent } from './sales-dash.component';

describe('SalesDashComponent', () => {
  let component: SalesDashComponent;
  let fixture: ComponentFixture<SalesDashComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesDashComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SalesDashComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
