import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OfficerTargetComponent } from './officer-target.component';

describe('OfficerTargetComponent', () => {
  let component: OfficerTargetComponent;
  let fixture: ComponentFixture<OfficerTargetComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OfficerTargetComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(OfficerTargetComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
