import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditCertificateDetailsComponent } from './edit-certificate-details';

describe('EditCertificateDetailsComponent', () => {
  let component: EditCertificateDetailsComponent;
  let fixture: ComponentFixture<EditCertificateDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditCertificateDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditCertificateDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
