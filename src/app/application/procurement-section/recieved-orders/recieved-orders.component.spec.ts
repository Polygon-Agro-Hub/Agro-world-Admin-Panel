import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RecievedOrdersComponent } from './recieved-orders.component';

describe('RecievedOrdersComponent', () => {
  let component: RecievedOrdersComponent;
  let fixture: ComponentFixture<RecievedOrdersComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RecievedOrdersComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(RecievedOrdersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
