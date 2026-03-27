import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GovishopDashbordComponent } from './govishop-dashbord.component';

describe('GovishopDashbordComponent', () => {
  let component: GovishopDashbordComponent;
  let fixture: ComponentFixture<GovishopDashbordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GovishopDashbordComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GovishopDashbordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
