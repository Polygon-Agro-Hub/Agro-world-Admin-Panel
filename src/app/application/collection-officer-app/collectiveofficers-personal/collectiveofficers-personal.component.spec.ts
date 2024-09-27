import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CollectiveofficersPersonalComponent } from './collectiveofficers-personal.component';

describe('CollectiveofficersPersonalComponent', () => {
  let component: CollectiveofficersPersonalComponent;
  let fixture: ComponentFixture<CollectiveofficersPersonalComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CollectiveofficersPersonalComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(CollectiveofficersPersonalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
