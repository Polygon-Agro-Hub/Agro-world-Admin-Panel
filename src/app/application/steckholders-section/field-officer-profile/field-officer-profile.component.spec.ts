import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FieldOfficerProfileComponent } from './field-officer-profile.component';

describe('FieldOfficerProfileComponent', () => {
  let component: FieldOfficerProfileComponent;
  let fixture: ComponentFixture<FieldOfficerProfileComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FieldOfficerProfileComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FieldOfficerProfileComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
