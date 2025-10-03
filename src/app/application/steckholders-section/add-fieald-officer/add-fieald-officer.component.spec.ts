import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFiealdOfficerComponent } from './add-fieald-officer.component';

describe('AddFiealdOfficerComponent', () => {
  let component: AddFiealdOfficerComponent;
  let fixture: ComponentFixture<AddFiealdOfficerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddFiealdOfficerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddFiealdOfficerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
