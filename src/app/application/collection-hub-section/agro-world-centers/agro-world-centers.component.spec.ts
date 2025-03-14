import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AgroWorldCentersComponent } from './agro-world-centers.component';

describe('AgroWorldCentersComponent', () => {
  let component: AgroWorldCentersComponent;
  let fixture: ComponentFixture<AgroWorldCentersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AgroWorldCentersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(AgroWorldCentersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
