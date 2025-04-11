import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SalesdashOrdersComponent } from './salesdash-orders.component';

describe('SalesdashOrdersComponent', () => {
  let component: SalesdashOrdersComponent;
  let fixture: ComponentFixture<SalesdashOrdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesdashOrdersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SalesdashOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
