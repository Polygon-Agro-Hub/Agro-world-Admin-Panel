import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PublicForumComponent } from './public-forum.component';

describe('PublicForumComponent', () => {
  let component: PublicForumComponent;
  let fixture: ComponentFixture<PublicForumComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PublicForumComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PublicForumComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
