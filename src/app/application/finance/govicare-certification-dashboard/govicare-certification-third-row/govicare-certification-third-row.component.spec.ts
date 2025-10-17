import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GovicareCertificationThirdRowComponent } from './govicare-certification-third-row.component';

describe('GovicareCertificationThirdRowComponent', () => {
  let component: GovicareCertificationThirdRowComponent;
  let fixture: ComponentFixture<GovicareCertificationThirdRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GovicareCertificationThirdRowComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GovicareCertificationThirdRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
