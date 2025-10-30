import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IndividualFarmersAuditsComponent } from './individual-farmers-audits.component';

describe('IndividualFarmersAuditsComponent', () => {
  let component: IndividualFarmersAuditsComponent;
  let fixture: ComponentFixture<IndividualFarmersAuditsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IndividualFarmersAuditsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(IndividualFarmersAuditsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
