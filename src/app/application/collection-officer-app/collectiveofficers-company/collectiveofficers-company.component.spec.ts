import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectiveofficersCompanyComponent } from './collectiveofficers-company.component';

describe('CollectiveofficersCompanyComponent', () => {
  let component: CollectiveofficersCompanyComponent;
  let fixture: ComponentFixture<CollectiveofficersCompanyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectiveofficersCompanyComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CollectiveofficersCompanyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
