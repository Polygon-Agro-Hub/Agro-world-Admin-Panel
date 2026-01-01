import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecievedReturnsComponent } from './recieved-returns.component';

describe('RecievedReturnsComponent', () => {
  let component: RecievedReturnsComponent;
  let fixture: ComponentFixture<RecievedReturnsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecievedReturnsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RecievedReturnsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
