import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ActivatedRoute, convertToParamMap, provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { WritersModule } from '../writers-module';
import { WriterDetail } from './writer-detail';

const API = 'http://localhost:8000/api/v1';

const book = (id: number, title: string) => ({
  id, title, author: 'P. Wells', category: "Children's", format: 'Paperback', brand: 'Scholastic', price: 8.99, rating: 4.9,
  description: `About ${title}`, image_url: '', back_image_url: null, language: 'English', genre_group: 'Fiction',
  author_bio: null, author_image_url: null, stock: 10, popularity: 1, published_date: null,
  tentative_delivery_date: '2026-07-21', section: 'new-launch',
});

const WRITER = {
  id: 14, name: 'P. Wells', bio: 'P. Wells writes children books.', image_url: '', book_count: 2, following: false,
  books: [book(19, "Little Dragon's Day"), book(20, 'Counting Stars')],
};

const reply = (data: unknown) => ({ success: true, message: '', data });

describe('WriterDetail', () => {
  let fixture: ComponentFixture<WriterDetail>;
  let http: HttpTestingController;

  beforeEach(async () => {
    localStorage.setItem('bookstore.token', 'abc');
    await TestBed.configureTestingModule({
      imports: [WritersModule],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ActivatedRoute, useValue: { paramMap: of(convertToParamMap({ id: '14' })) } },
      ],
    }).compileComponents();

    http = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(WriterDetail);
    fixture.detectChanges();
    http.expectOne(`${API}/writers/14`).flush(reply(WRITER));
    fixture.detectChanges();
  });

  afterEach(() => localStorage.clear());

  it('shows the writer profile and their books', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('P. Wells');
    expect(el.textContent).toContain('2 books');
    expect(el.textContent).toContain('Books by P. Wells');
    expect(el.querySelectorAll('app-product-card').length).toBe(2);
    expect(el.textContent).toContain('Add to My Writers');
  });

  it('toggles following', () => {
    fixture.componentInstance.toggleFollow();
    http.expectOne({ method: 'POST', url: `${API}/writers/14/follow` }).flush(reply({ ...WRITER, following: true }));
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.textContent).toContain('Remove from My Writers');
    expect(el.textContent).toContain('P. Wells added to My Writers');
    expect(el.querySelectorAll('app-product-card').length).toBe(2);
  });
});
