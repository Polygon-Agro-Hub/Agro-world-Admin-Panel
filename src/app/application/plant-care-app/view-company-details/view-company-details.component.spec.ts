import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewCompanyDetailsComponent } from './view-company-details';

describe('ViewCompanyDetailsComponent', () => {
  let component: ViewCompanyDetailsComponent;
  let fixture: ComponentFixture<ViewCompanyDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewCompanyDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewCompanyDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
