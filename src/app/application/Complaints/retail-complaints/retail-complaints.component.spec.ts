import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RetailComplaintsComponent } from './retail-complaints.component';

describe('RetailComplaintsComponent', () => {
  let component: RetailComplaintsComponent;
  let fixture: ComponentFixture<RetailComplaintsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RetailComplaintsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RetailComplaintsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
