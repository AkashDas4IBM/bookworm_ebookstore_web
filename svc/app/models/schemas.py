from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    first_name: str = Field(min_length=1, max_length=50)
    last_name: str = Field(min_length=1, max_length=50)
    email: EmailStr
    password: str = Field(min_length=8, max_length=64)
    phone: str | None = Field(default=None, pattern=r"^\+?[0-9]{7,15}$")


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class Address(BaseModel):
    id: int
    label: str
    line1: str
    city: str
    state: str
    postal_code: str
    country: str


class UserOut(BaseModel):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    phone: str | None = None
    gift_points: int = 0
    addresses: list[Address] = []


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


class Product(BaseModel):
    id: int
    title: str
    author: str
    category: str
    format: str
    brand: str
    price: float
    rating: float
    description: str
    image_url: str
    back_image_url: str | None = None
    language: str = "English"
    genre_group: str | None = None
    author_bio: str | None = None
    author_image_url: str | None = None
    stock: int
    popularity: int = 0  # copies sold
    published_date: str | None = None
    section: str
    tentative_delivery_date: str | None = None


class ReviewCreate(BaseModel):
    rating: int = Field(ge=1, le=5)
    comment: str = Field(min_length=1, max_length=100)
    name: str | None = Field(default=None, max_length=50)


class Review(BaseModel):
    id: int
    product_id: int
    name: str
    rating: int
    comment: str
    created_at: str


class Category(BaseModel):
    id: int
    name: str


class CartItemIn(BaseModel):
    product_id: int
    quantity: int = Field(default=1, ge=1, le=10)


class CartQuantityIn(BaseModel):
    quantity: int = Field(ge=0, le=10)


class PriceSummary(BaseModel):
    item_count: int
    subtotal: float
    tax: float
    delivery_charge: float
    discount: float
    coupon_code: str | None = None
    points_redeemed: int
    points_discount: float
    total: float


class CartLine(BaseModel):
    product: Product
    quantity: int
    line_total: float


class CartOut(BaseModel):
    items: list[CartLine]
    summary: PriceSummary


class SummaryRequest(BaseModel):
    coupon_code: str | None = Field(default=None, max_length=30)
    points_to_redeem: int = Field(default=0, ge=0)


class ShippingAddressIn(BaseModel):
    first_name: str = Field(min_length=1, max_length=50)
    last_name: str = Field(min_length=1, max_length=50)
    email: EmailStr
    phone: str = Field(pattern=r"^\+?[0-9]{7,15}$")
    line1: str = Field(min_length=3, max_length=120)
    city: str = Field(min_length=1, max_length=60)
    state: str = Field(min_length=1, max_length=60)
    postal_code: str = Field(pattern=r"^[0-9]{6}$")
    country: str = Field(min_length=1, max_length=60)


class ShippingAddress(BaseModel):
    first_name: str
    last_name: str
    email: str
    phone: str
    line1: str
    city: str
    state: str
    postal_code: str
    country: str


class PaymentMethod(BaseModel):
    id: str
    label: str
    description: str
    options: list[str] = []  # e.g. the wallets offered under "Wallet"


class PaymentInitRequest(BaseModel):
    coupon_code: str | None = Field(default=None, max_length=30)
    points_to_redeem: int = Field(default=0, ge=0)


class CardDetails(BaseModel):
    number: str = Field(max_length=25)
    name: str = Field(max_length=60)
    cvv: str = Field(max_length=4)
    expiry: str = Field(max_length=7)  # MM/YYYY


class PayRequest(BaseModel):
    method: str
    card: CardDetails | None = None
    upi_id: str | None = Field(default=None, max_length=60)
    wallet: str | None = Field(default=None, max_length=30)


class PaymentOut(BaseModel):
    id: str
    amount: float
    status: str  # Initiated, Failed, Paid, Used
    method: str | None = None
    coupon_code: str | None = None
    points_to_redeem: int = 0
    reference: str | None = None
    message: str = ""


class PlaceOrderRequest(BaseModel):
    address: ShippingAddressIn
    payment_id: str = Field(min_length=1, max_length=40)


class OrderItemOut(BaseModel):
    product_id: int
    title: str
    author: str
    format: str
    image_url: str
    description: str = ""
    category: str = ""
    genre_group: str | None = None
    quantity: int
    unit_price: float
    line_total: float


class OrderOut(BaseModel):
    id: int
    status: str
    placed_at: str
    items: list[OrderItemOut]
    subtotal: float
    tax: float
    delivery_charge: float
    discount: float
    coupon_code: str | None = None
    points_redeemed: int
    points_earned: int
    total: float
    payment_method: str
    payment_reference: str | None = None
    address: ShippingAddress
    estimated_delivery: str
    cancellable: bool
    cancel_deadline: str | None = None


class Author(BaseModel):
    id: int
    name: str
    bio: str | None = None
    image_url: str | None = None
    book_count: int
    following: bool = False


class AuthorDetail(Author):
    books: list[Product]



class WishlistItemIn(BaseModel):
    product_id: int
