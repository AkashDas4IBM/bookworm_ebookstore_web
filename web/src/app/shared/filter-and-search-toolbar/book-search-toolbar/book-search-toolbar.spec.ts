import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { SharedModule } from '../../shared-module';

import { BookSearchToolbar } from './book-search-toolbar';

describe('BookSearchToolbar', () => {
  let component: BookSearchToolbar;
  let fixture: ComponentFixture<BookSearchToolbar>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SharedModule],
      providers: [provideHttpClient()],
    }).compileComponents();

    fixture = TestBed.createComponent(BookSearchToolbar);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
