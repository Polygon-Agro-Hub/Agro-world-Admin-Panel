import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReciverinfoPopupComponent } from './reciverinfo-popup.component';

describe('ReciverinfoPopupComponent', () => {
  let component: ReciverinfoPopupComponent;
  let fixture: ComponentFixture<ReciverinfoPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReciverinfoPopupComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ReciverinfoPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
