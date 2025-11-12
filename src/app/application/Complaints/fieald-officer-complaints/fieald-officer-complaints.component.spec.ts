import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FiealdOfficerComplaintsComponent } from './fieald-officer-complaints.component';

describe('FiealdOfficerComplaintsComponent', () => {
  let component: FiealdOfficerComplaintsComponent;
  let fixture: ComponentFixture<FiealdOfficerComplaintsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FiealdOfficerComplaintsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FiealdOfficerComplaintsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
