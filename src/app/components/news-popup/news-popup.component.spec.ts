import { ComponentFixture, TestBed } from '@angular/core/testing';

import { NewsPopupComponent } from './news-popup.component';

describe('NewsPopupComponent', () => {
  let component: NewsPopupComponent;
  let fixture: ComponentFixture<NewsPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [NewsPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(NewsPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
