import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MarshallMattersComponent } from './marshall-matters.component';

describe('MarshallMattersComponent', () => {
  let component: MarshallMattersComponent;
  let fixture: ComponentFixture<MarshallMattersComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MarshallMattersComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MarshallMattersComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
