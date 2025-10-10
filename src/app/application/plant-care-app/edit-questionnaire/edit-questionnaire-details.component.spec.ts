import { ComponentFixture, TestBed } from '@angular/core/testing';
import { EditQuestionnaireDetailsComponent } from './edit-questionnaire-details';

describe('EditQuestionnaireDetailsComponent', () => {
  let component: EditQuestionnaireDetailsComponent;
  let fixture: ComponentFixture<EditQuestionnaireDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EditQuestionnaireDetailsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(EditQuestionnaireDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
