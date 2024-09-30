import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewPublicForumComponent } from './view-public-forum.component';

describe('ViewPublicForumComponent', () => {
  let component: ViewPublicForumComponent;
  let fixture: ComponentFixture<ViewPublicForumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewPublicForumComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewPublicForumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
