import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditFiealdOfficerComponent } from './edit-fieald-officer.component';

describe('EditFiealdOfficerComponent', () => {
  let component: EditFiealdOfficerComponent;
  let fixture: ComponentFixture<EditFiealdOfficerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditFiealdOfficerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditFiealdOfficerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
