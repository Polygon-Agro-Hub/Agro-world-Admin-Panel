import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewAllCertificatesComponent } from './view-all-certificates.component';

describe('ViewAllCertificatesComponent', () => {
  let component: ViewAllCertificatesComponent;
  let fixture: ComponentFixture<ViewAllCertificatesComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewAllCertificatesComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewAllCertificatesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
