import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GovicarePichartComponent } from './govicare-pichart.component';

describe('GovicarePichartComponent', () => {
  let component: GovicarePichartComponent;
  let fixture: ComponentFixture<GovicarePichartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GovicarePichartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GovicarePichartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
