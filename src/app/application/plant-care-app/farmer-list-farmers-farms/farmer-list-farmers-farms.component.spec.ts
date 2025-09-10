import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmerListFarmersFarmsComponent } from './farmer-list-farmers-farms.component';

describe('FarmerListFarmersFarmsComponent', () => {
  let component: FarmerListFarmersFarmsComponent;
  let fixture: ComponentFixture<FarmerListFarmersFarmsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FarmerListFarmersFarmsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FarmerListFarmersFarmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
