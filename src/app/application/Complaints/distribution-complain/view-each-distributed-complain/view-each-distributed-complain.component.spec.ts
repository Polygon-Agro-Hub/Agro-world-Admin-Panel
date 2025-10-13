import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ViewEachDistributedComplainComponent } from './view-each-distributed-complain.component';

describe('ViewEachDistributedComplainComponent', () => {
  let component: ViewEachDistributedComplainComponent;
  let fixture: ComponentFixture<ViewEachDistributedComplainComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ViewEachDistributedComplainComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(ViewEachDistributedComplainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
