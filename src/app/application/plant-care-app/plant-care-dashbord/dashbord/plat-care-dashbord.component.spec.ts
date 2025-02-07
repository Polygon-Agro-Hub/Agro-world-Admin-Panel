import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PlatCareDashbordComponent } from './plat-care-dashbord.component';

describe('PlatCareDashbordComponent', () => {
  let component: PlatCareDashbordComponent;
  let fixture: ComponentFixture<PlatCareDashbordComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PlatCareDashbordComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PlatCareDashbordComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
