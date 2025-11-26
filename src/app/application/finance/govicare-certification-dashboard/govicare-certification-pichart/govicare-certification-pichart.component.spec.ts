import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GovicareCertificationPichartComponent } from './govicare-certification-pichart.component';

describe('GovicareCertificationPichartComponent', () => {
  let component: GovicareCertificationPichartComponent;
  let fixture: ComponentFixture<GovicareCertificationPichartComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GovicareCertificationPichartComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GovicareCertificationPichartComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
