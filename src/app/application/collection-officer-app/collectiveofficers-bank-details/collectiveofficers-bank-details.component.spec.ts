import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectiveofficersBankDetailsComponent } from './collectiveofficers-bank-details.component';

describe('CollectiveofficersBankDetailsComponent', () => {
  let component: CollectiveofficersBankDetailsComponent;
  let fixture: ComponentFixture<CollectiveofficersBankDetailsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectiveofficersBankDetailsComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CollectiveofficersBankDetailsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
