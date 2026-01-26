import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PensionRequestsComponent } from './pension-requests.component';

describe('PensionRequestsComponent', () => {
  let component: PensionRequestsComponent;
  let fixture: ComponentFixture<PensionRequestsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PensionRequestsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PensionRequestsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
