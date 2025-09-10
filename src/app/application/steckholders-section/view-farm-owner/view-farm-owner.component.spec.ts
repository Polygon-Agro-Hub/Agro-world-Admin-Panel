import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewFarmOwnerComponent } from './view-farm-owner.component';

describe('ViewFarmOwnerComponent', () => {
  let component: ViewFarmOwnerComponent;
  let fixture: ComponentFixture<ViewFarmOwnerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewFarmOwnerComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewFarmOwnerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
