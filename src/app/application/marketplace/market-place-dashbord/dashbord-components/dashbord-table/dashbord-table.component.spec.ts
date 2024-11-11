import { ComponentFixture, TestBed } from '@angular/core/testing';

import { DashbordTableComponent } from './dashbord-table.component';

describe('DashbordTableComponent', () => {
  let component: DashbordTableComponent;
  let fixture: ComponentFixture<DashbordTableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [DashbordTableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(DashbordTableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
