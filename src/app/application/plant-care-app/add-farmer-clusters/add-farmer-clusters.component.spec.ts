import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddFarmerClustersComponent } from './add-farmer-clusters.component';

describe('AddFarmerClustersComponent', () => {
  let component: AddFarmerClustersComponent;
  let fixture: ComponentFixture<AddFarmerClustersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddFarmerClustersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AddFarmerClustersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
