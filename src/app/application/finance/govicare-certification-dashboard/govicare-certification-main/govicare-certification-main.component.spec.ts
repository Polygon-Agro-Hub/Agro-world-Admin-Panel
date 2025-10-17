import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GovicareCertificationMainComponent } from './govicare-certification-main.component';

describe('GovicareCertificationMainComponent', () => {
  let component: GovicareCertificationMainComponent;
  let fixture: ComponentFixture<GovicareCertificationMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GovicareCertificationMainComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GovicareCertificationMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
