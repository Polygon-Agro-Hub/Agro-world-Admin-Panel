import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SelectedOfficerTargetComponent } from './selected-officer-target.component';

describe('SelectedOfficerTargetComponent', () => {
  let component: SelectedOfficerTargetComponent;
  let fixture: ComponentFixture<SelectedOfficerTargetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SelectedOfficerTargetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(SelectedOfficerTargetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
