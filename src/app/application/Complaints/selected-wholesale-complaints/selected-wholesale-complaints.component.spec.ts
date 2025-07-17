import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedWholesaleComplaintsComponent } from './selected-wholesale-complaints.component';

describe('SelectedWholesaleComplaintsComponent', () => {
  let component: SelectedWholesaleComplaintsComponent;
  let fixture: ComponentFixture<SelectedWholesaleComplaintsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectedWholesaleComplaintsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SelectedWholesaleComplaintsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
