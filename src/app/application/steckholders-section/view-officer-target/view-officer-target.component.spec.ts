import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewOfficerTargetComponent } from './view-officer-target.component';

describe('ViewOfficerTargetComponent', () => {
  let component: ViewOfficerTargetComponent;
  let fixture: ComponentFixture<ViewOfficerTargetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewOfficerTargetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewOfficerTargetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
