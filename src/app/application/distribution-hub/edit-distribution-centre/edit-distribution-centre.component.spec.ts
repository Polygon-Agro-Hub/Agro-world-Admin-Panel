import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EditDistributionCentreComponent } from './edit-distribution-centre.component';

describe('EditDistributionCentreComponent', () => {
  let component: EditDistributionCentreComponent;
  let fixture: ComponentFixture<EditDistributionCentreComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditDistributionCentreComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(EditDistributionCentreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
