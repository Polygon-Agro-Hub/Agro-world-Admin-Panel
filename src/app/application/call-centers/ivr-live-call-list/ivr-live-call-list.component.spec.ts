import { ComponentFixture, TestBed } from '@angular/core/testing';

import { IvrLiveCallListComponent } from './ivr-live-call-list.component';

describe('IvrLiveCallListComponent', () => {
  let component: IvrLiveCallListComponent;
  let fixture: ComponentFixture<IvrLiveCallListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [IvrLiveCallListComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(IvrLiveCallListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
