import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FarmerFarmsComponent } from './farmer-farms.component';

describe('FarmerFarmsComponent', () => {
  let component: FarmerFarmsComponent;
  let fixture: ComponentFixture<FarmerFarmsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FarmerFarmsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(FarmerFarmsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
