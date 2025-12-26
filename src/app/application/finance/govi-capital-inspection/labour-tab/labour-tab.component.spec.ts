import { ComponentFixture, TestBed } from '@angular/core/testing';

import { LabourTabComponent } from './labour-tab.component';

describe('LabourTabComponent', () => {
  let component: LabourTabComponent;
  let fixture: ComponentFixture<LabourTabComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LabourTabComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(LabourTabComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
