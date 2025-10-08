import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewCertificateDetailsComponent } from './view-certificate-details';

describe('ViewCertificateDetailsComponent', () => {
  let component: ViewCertificateDetailsComponent;
  let fixture: ComponentFixture<ViewCertificateDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewCertificateDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewCertificateDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
