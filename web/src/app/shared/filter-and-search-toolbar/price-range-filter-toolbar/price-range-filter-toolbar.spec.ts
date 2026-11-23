import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { SharedModule } from '../../shared-module';

import { PriceRangeFilterToolbar } from './price-range-filter-toolbar';

describe('PriceRangeFilterToolbar', () => {
  let component: PriceRangeFilterToolbar;
  let fixture: ComponentFixture<PriceRangeFilterToolbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(PriceRangeFilterToolbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
