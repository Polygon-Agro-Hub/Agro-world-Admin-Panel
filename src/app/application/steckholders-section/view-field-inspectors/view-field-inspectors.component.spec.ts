import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewFieldInspectorsComponent } from './view-field-inspectors';

describe('ViewFieldInspectorsComponent', () => {
  let component: ViewFieldInspectorsComponent;
  let fixture: ComponentFixture<ViewFieldInspectorsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewFieldInspectorsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewFieldInspectorsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
