import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ViewGoviLinkJobsComponent } from './view-govi-link-jobs';

describe('ViewGoviLinkJobsComponent', () => {
  let component: ViewGoviLinkJobsComponent;
  let fixture: ComponentFixture<ViewGoviLinkJobsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewGoviLinkJobsComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewGoviLinkJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
