import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddDestributionCenterComponent } from './add-destribution-center.component';

describe('AddDestributionCenterComponent', () => {
  let component: AddDestributionCenterComponent;
  let fixture: ComponentFixture<AddDestributionCenterComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddDestributionCenterComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddDestributionCenterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
