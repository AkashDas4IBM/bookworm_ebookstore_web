"""In-memory mock data. Replace with a real database layer later."""
from app.core.security import hash_password
from app.utils.pricing import compute_summary

CATEGORIES = [
    {"id": 1, "name": "All"},
    {"id": 2, "name": "Romance"},
    {"id": 3, "name": "Mystery"},
    {"id": 4, "name": "Science Fiction"},
    {"id": 5, "name": "Business"},
    {"id": 6, "name": "Children's"},
    {"id": 7, "name": "Science"},
    {"id": 8, "name": "Fantasy"},
    {"id": 9, "name": "Historical"},
    {"id": 10, "name": "Biography"},
    {"id": 11, "name": "Self-help"},
    {"id": 12, "name": "Memoir"},
    {"id": 13, "name": "Travel"},
    {"id": 14, "name": "Cooking"},
    {"id": 15, "name": "Young Adult"},
    {"id": 16, "name": "Comics & Graphic Novels"},
    {"id": 17, "name": "Poetry"},
    {"id": 18, "name": "Drama"},
    {"id": 19, "name": "Philosophy"},
    {"id": 20, "name": "Religion"},
    {"id": 21, "name": "Language Learning"},
    {"id": 22, "name": "Technology"},

]

_img = "https://picsum.photos/seed/book{}/300/400"

PRODUCTS = [
    # Recommended for You section books
    {"id": 1, "title": "The Art of Focus", "author": "Arjun Patel", "category": "Self-help", "format": "Paperback", "brand": "Jaico Publishing House", "price": 399, "rating": 4.8, "stock": 25, "popularity": 920, "published_date": "2025-06-10", "description": "Practical guide to mastering focus & boosting productivity every day.", "section": "recommended"},
    {"id": 2, "title": "The Art of Learning", "author": "Raj Patel", "category": "Self-help", "format": "Paperback", "brand": "Penguin Random House India", "price": 259, "rating": 4.6, "stock": 30, "popularity": 780, "published_date": "2024-11-05", "description": "Master the mindset and methods for effective lifelong learning.", "section": "recommended"},
    {"id": 3, "title": "The Path to Success", "author": "James Wright", "category": "Self-help", "format": "Paperback", "brand": "Hay House", "price": 359, "rating": 4.7, "stock": 20, "popularity": 650, "published_date": "2025-01-20", "description": "A practical guide to achieving goals with clarity and confidence.", "section": "recommended"},
    {"id": 4, "title": "The Silent Harbour", "author": "A. Marlowe", "category": "Fiction", "format": "Paperback", "brand": "Penguin", "price": 1299, "rating": 4.5, "stock": 25, "popularity": 540, "published_date": "2024-08-15", "description": "A gripping coastal mystery.", "section": "recommended"},
    {"id": 5, "title": "Midnight Library Notes", "author": "R. Haig", "category": "Fiction", "format": "Paperback", "brand": "HarperCollins", "price": 1049, "rating": 4.2, "stock": 40, "popularity": 480, "published_date": "2023-12-01", "description": "A reflective tale of second chances.", "section": "recommended"},
    {"id": 6, "title": "FastAPI Handbook", "author": "T. Lopez", "category": "Technology", "format": "eBook", "brand": "O'Reilly", "price": 299, "rating": 4.6, "stock": 22, "popularity": 700, "published_date": "2025-03-12", "description": "High-performance Python APIs.", "section": "bestseller"},

    # Bestsellers this Month
    {"id": 7, "title": "The Midnight Hour", "author": "James Adams", "category": "Mystery", "format": "Paperback", "brand": "HarperCollins", "price": 299, "rating": 4.9, "stock": 15, "popularity": 1500, "published_date": "2025-05-18", "description": "Haunting tale of a man's journey & the shadows of a forgotten past.", "section": "bestseller"},
    {"id": 8, "title": "Beneath the Stars", "author": "Jessica Martin", "category": "Romance", "format": "Hardcover", "brand": "Harlequin", "price": 499, "rating": 4.5, "stock": 12, "popularity": 1100, "published_date": "2025-02-14", "description": "A heartwarming tale, where two souls discover who you need.", "section": "bestseller"},
    {"id": 9, "title": "The Final Frontier", "author": "Laura Mitchell", "category": "Science Fiction", "format": "Paperback", "brand": "Tor Books", "price": 359, "rating": 4.8, "stock": 40, "popularity": 1300, "published_date": "2025-04-22", "description": "A mission to space secrets to change humanity forever.", "section": "bestseller"},
    {"id": 10, "title": "Clean Code in Practice", "author": "R. Martin", "category": "Technology", "format": "eBook", "brand": "Pearson", "price": 399, "rating": 4.8, "stock": 15, "popularity": 1650, "published_date": "2024-09-30", "description": "Writing maintainable software.", "section": "bestseller"},
    {"id": 11, "title": "Learning Angular", "author": "S. Gupta", "category": "Technology", "format": "eBook", "brand": "O'Reilly", "price": 345, "rating": 4.4, "stock": 30, "popularity": 900, "published_date": "2025-05-02", "description": "Build modern web apps with Angular.", "section": "bestseller"},
    {"id": 12, "title": "Lean Startup Playbook", "author": "E. Ross", "category": "Business", "format": "Hardcover", "brand": "Penguin", "price": 18, "rating": 4.3, "stock": 50, "popularity": 820, "published_date": "2024-07-07", "description": "Build, measure, learn.", "section": "bestseller"},

    # New Launches
    {"id": 13, "title": "The Joy of Minimalism", "author": "Daniel Reed", "category": "Self-help", "format": "Paperback", "brand": "Hay House", "price": 149, "rating": 4.4, "stock": 50, "popularity": 300, "published_date": "2025-07-01", "description": "Declutter your life to uncover peace, clarity, and joy.", "section": "new-launch"},
    {"id": 14, "title": "The Vanishing House", "author": "Clara Nelson", "category": "Mystery", "format": "eBook", "brand": "Hachette India", "price": 99, "rating": 4.2, "stock": 60, "popularity": 210, "published_date": "2025-07-10", "description": "A chilling mystery unfolds within a house that disappears.", "section": "new-launch"},
    {"id": 15, "title": "The Lost Kitten", "author": "Emilly Parker", "category": "Children's", "format": "Hardcover", "brand": "Scholastic", "price": 339, "rating": 4.9, "stock": 35, "popularity": 410, "published_date": "2025-06-28", "description": "A heartwarming tale of courage, friendship, and feline adventure.", "section": "new-launch"},
    {"id": 16, "title": "Strategy That Works", "author": "M. Porter", "category": "Business", "format": "Paperback", "brand": "Pearson", "price": 24.75, "rating": 4.1, "stock": 12, "popularity": 150, "published_date": "2025-07-05", "description": "Competitive strategy fundamentals.", "section": "new-launch"},
    {"id": 17, "title": "Cosmos Explained", "author": "N. Tyson", "category": "Science", "format": "Paperback", "brand": "HarperCollins", "price": 16.20, "rating": 4.7, "stock": 35, "popularity": 260, "published_date": "2025-06-15", "description": "A tour of the universe.", "section": "new-launch"},
    {"id": 18, "title": "The Living Cell", "author": "L. Chen", "category": "Science", "format": "Paperback", "brand": "Pearson", "price": 27.80, "rating": 4.0, "stock": 0, "popularity": 90, "published_date": "2025-06-20", "description": "Biology from the inside out.", "section": "new-launch"},
    {"id": 19, "title": "Little Dragon's Day", "author": "P. Wells", "category": "Children's", "format": "Paperback", "brand": "Scholastic", "price": 8.99, "rating": 4.9, "stock": 60, "popularity": 480, "published_date": "2025-07-12", "description": "A picture book adventure.", "section": "new-launch"},
    {"id": 20, "title": "Counting Stars", "author": "P. Wells", "category": "Children's", "format": "Paperback", "brand": "Scholastic", "price": 7.49, "rating": 4.6, "stock": 45, "popularity": 350, "published_date": "2025-07-15", "description": "Learn numbers at bedtime.", "section": "new-launch"},
]
_back_img = "https://picsum.photos/seed/bookback{}/300/400"
_author_img = "https://picsum.photos/seed/author{}/200/200"

_NON_FICTION = {
    "Self-help", "Business", "Technology", "Science", "Biography", "Memoir",
    "Travel", "Cooking", "Philosophy", "Religion", "Language Learning",
}

for _p in PRODUCTS:
    _p["image_url"] = _img.format(_p["id"])
    _p["back_image_url"] = _back_img.format(_p["id"])
    _p["language"] = "English"
    _p["genre_group"] = "Non-fiction" if _p["category"] in _NON_FICTION else "Fiction"
    _p["author_image_url"] = _author_img.format(_p["author"].replace(" ", "").replace(".", ""))

for _p in PRODUCTS:
    _titles = ", ".join(q["title"] for q in PRODUCTS if q["author"] == _p["author"])
    _p["author_bio"] = (
        f"{_p['author']} writes about {_p['category'].lower()} and is the author of {_titles}. "
        f"With a passion for clear and engaging writing, {_p['author']} has reached thousands of "
        f"readers through {_p['brand']}."
    )

REVIEWS = [
    {"id": 1, "product_id": 13, "name": "John Smith", "rating": 5, "comment": "The accordion component delivers large amounts of content in a small space through progressive disclosure.", "created_at": "2025-07-01T10:00:00+00:00"},
    {"id": 2, "product_id": 13, "name": "Priya Nair", "rating": 4, "comment": "A calm, practical read. I finally cleared my desk and my mind.", "created_at": "2025-07-08T16:20:00+00:00"},
    {"id": 3, "product_id": 1, "name": "Rahul Sen", "rating": 5, "comment": "Short chapters and real exercises. My focus has improved noticeably.", "created_at": "2025-06-20T09:30:00+00:00"},
    {"id": 4, "product_id": 10, "name": "Alice Brown", "rating": 5, "comment": "Every developer should read this at least once.", "created_at": "2025-05-11T12:45:00+00:00"},
]

USERS = [
    {
        "id": 1,
        "first_name": "Demo",
        "last_name": "User",
        "email": "demo@bookstore.com",
        "phone": "+14155550101",
        "password_hash": hash_password("Password@123"),
        "gift_points": 250,
        "addresses": [
            {"id": 1, "label": "Home", "line1": "12 Park Street", "city": "Kolkata", "state": "West Bengal", "postal_code": "700016", "country": "India"},
            {"id": 2, "label": "Office", "line1": "Tech Park, Block B", "city": "Bengaluru", "state": "Karnataka", "postal_code": "560103", "country": "India"},
        ],
    },
    {
        "id": 2,
        "first_name": "Jane",
        "last_name": "Reader",
        "email": "jane@bookstore.com",
        "phone": None,
        "password_hash": hash_password("Password@123"),
        "gift_points": 80,
        "addresses": [
            {"id": 1, "label": "Home", "line1": "5 Library Lane", "city": "Mumbai", "state": "Maharashtra", "postal_code": "400001", "country": "India"},
        ],
    },
]

def _seed_order(order_id: int, user_id: int, lines: list[tuple[int, int]], status: str, placed_at: str) -> dict:
    user = next(u for u in USERS if u["id"] == user_id)
    items, priced = [], []
    for product_id, qty in lines:
        price = next(p["price"] for p in PRODUCTS if p["id"] == product_id)
        items.append({"product_id": product_id, "quantity": qty, "unit_price": price})
        priced.append((price, qty))
    summary = compute_summary(priced)
    home = user["addresses"][0]
    return {
        "id": order_id,
        "user_id": user_id,
        "items": items,
        **{k: summary[k] for k in ("subtotal", "tax", "delivery_charge", "discount", "total")},
        "coupon_code": None,
        "points_redeemed": 0,
        "points_earned": int(summary["total"] // 100),
        "payment_method": "credit_card",
        "address": {
            "first_name": user["first_name"], "last_name": user["last_name"], "email": user["email"],
            "phone": user["phone"] or "", "line1": home["line1"], "city": home["city"],
            "state": home["state"], "postal_code": home["postal_code"], "country": home["country"],
        },
        "status": status,
        "placed_at": placed_at,
    }


# Past orders drive "Buy it again" and the recommendations
ORDERS = [
    _seed_order(1001, 1, [(3, 1), (5, 1)], "Delivered", "2025-10-02T10:15:00+00:00"),
    _seed_order(1002, 1, [(8, 2)], "Delivered", "2025-11-20T14:30:00+00:00"),
    _seed_order(1003, 2, [(10, 1)], "Shipped", "2025-12-01T09:00:00+00:00"),
]

# Basket per user id. The demo user starts with the two books from the checkout design.
CARTS: dict[int, list[dict]] = {
    1: [{"product_id": 13, "quantity": 1}, {"product_id": 3, "quantity": 1}],
}

# Writers: one record per distinct product author (bio and photo come from the product data)
AUTHORS: list[dict] = []
for _p in PRODUCTS:
    if not any(a["name"] == _p["author"] for a in AUTHORS):
        AUTHORS.append({
            "id": len(AUTHORS) + 1,
            "name": _p["author"],
            "bio": _p["author_bio"],
            "image_url": _p["author_image_url"],
        })

# Per-user wishlist (product ids) and followed writers (author ids)
WISHLISTS: dict[int, list[int]] = {
    1: [1, 7, 9],
}
FOLLOWED_WRITERS: dict[int, list[int]] = {
    1: [1, 7],
}

COUPONS = {
    "WELCOME100": {"code": "WELCOME100", "type": "flat", "value": 100, "min_subtotal": 300, "description": "₹100 off orders above ₹300"},
    "READ10": {"code": "READ10", "type": "percent", "value": 10, "min_subtotal": 200, "max_discount": 150, "description": "10% off (max ₹150) on orders above ₹200"},
}

PAYMENT_METHODS = [
    {"id": "credit_card", "label": "Credit Card", "description": "Visa, Mastercard, RuPay", "options": []},
    {"id": "debit_card", "label": "Debit card", "description": "Visa, Mastercard, RuPay", "options": []},
    {"id": "upi", "label": "UPI", "description": "Pay with any UPI app", "options": []},
    {"id": "wallet", "label": "Wallet", "description": "Pay from a wallet balance", "options": ["Paytm", "PhonePe", "Amazon Pay"]},
]

# Payment attempts keyed by payment id (card details are never stored)
PAYMENTS: dict[str, dict] = {}

FORM_OPTIONS = {
    "country_codes": [
        {"code": "+91", "country": "India"},
        {"code": "+1", "country": "United States"},
        {"code": "+44", "country": "United Kingdom"},
    ],
    "countries": ["India", "United States", "United Kingdom"],
    "states": {
        "India": ["Delhi", "Gujarat", "Karnataka", "Kerala", "Maharashtra", "Rajasthan", "Tamil Nadu", "Telangana", "Uttar Pradesh", "West Bengal"],
        "United States": ["California", "Florida", "New York", "Texas", "Washington"],
        "United Kingdom": ["England", "Northern Ireland", "Scotland", "Wales"],
    },
}
