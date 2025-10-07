import { ComponentFixture, TestBed } from '@angular/core/testing';
import { AddQuestionnaireDetailsComponent } from './add-questionnaire-details';

describe('AddQuestionnaireDetailsComponent', () => {
  let component: AddQuestionnaireDetailsComponent;
  let fixture: ComponentFixture<AddQuestionnaireDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddQuestionnaireDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(AddQuestionnaireDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
