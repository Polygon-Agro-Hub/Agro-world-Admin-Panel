import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PikupOderRecordsMainComponent } from './pikup-oder-records-main.component';

describe('PikupOderRecordsMainComponent', () => {
  let component: PikupOderRecordsMainComponent;
  let fixture: ComponentFixture<PikupOderRecordsMainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PikupOderRecordsMainComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(PikupOderRecordsMainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
