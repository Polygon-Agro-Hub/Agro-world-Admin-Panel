import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedRetailComplaintsComponent } from './selected-retail-complaints.component';

describe('SelectedRetailComplaintsComponent', () => {
  let component: SelectedRetailComplaintsComponent;
  let fixture: ComponentFixture<SelectedRetailComplaintsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectedRetailComplaintsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SelectedRetailComplaintsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
