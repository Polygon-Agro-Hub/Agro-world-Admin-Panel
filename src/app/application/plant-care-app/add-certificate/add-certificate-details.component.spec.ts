import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddCertificateDetailsComponent } from './add-certificate-details';

describe('AddCertificateDetailsComponent', () => {
  let component: AddCertificateDetailsComponent;
  let fixture: ComponentFixture<AddCertificateDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddCertificateDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddCertificateDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
