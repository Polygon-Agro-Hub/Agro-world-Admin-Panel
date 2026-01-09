import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PikupOderRecordDetailsComponent } from './pikup-oder-record-details.component';

describe('PikupOderRecordDetailsComponent', () => {
  let component: PikupOderRecordDetailsComponent;
  let fixture: ComponentFixture<PikupOderRecordDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PikupOderRecordDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PikupOderRecordDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
