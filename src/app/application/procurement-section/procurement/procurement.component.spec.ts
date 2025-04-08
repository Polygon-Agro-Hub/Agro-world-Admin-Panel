import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ProcurementComponent } from './procurement.component';

describe('ProcurementComponent', () => {
  let component: ProcurementComponent;
  let fixture: ComponentFixture<ProcurementComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ProcurementComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ProcurementComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
