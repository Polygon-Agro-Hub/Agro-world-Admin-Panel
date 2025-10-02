import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditCompanyDetailsComponent } from './edit-company-details';

describe('EditCompanyDetailsComponent', () => {
  let component: EditCompanyDetailsComponent;
  let fixture: ComponentFixture<EditCompanyDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditCompanyDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditCompanyDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
