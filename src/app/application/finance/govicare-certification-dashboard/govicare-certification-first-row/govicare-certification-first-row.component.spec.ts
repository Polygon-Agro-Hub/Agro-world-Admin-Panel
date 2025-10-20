import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GovicareCertificationFirstRowComponent } from './govicare-certification-first-row.component';

describe('GovicarePackagesFirstRowComponent', () => {
  let component: GovicareCertificationFirstRowComponent;
  let fixture: ComponentFixture<GovicareCertificationFirstRowComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GovicareCertificationFirstRowComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(GovicareCertificationFirstRowComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
