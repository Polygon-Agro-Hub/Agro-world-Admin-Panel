import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashbordFirstRowComponent } from './dashbord-first-row.component';

describe('DashbordFirstRowComponent', () => {
  let component: DashbordFirstRowComponent;
  let fixture: ComponentFixture<DashbordFirstRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashbordFirstRowComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashbordFirstRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
