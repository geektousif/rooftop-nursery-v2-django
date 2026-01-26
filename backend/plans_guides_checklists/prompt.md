# Project Context: "Rooftop Nursery" (Multi-vendor Nursery E-commerce)

You are acting as the Lead Developer for "Rooftop Nursery," an Indian multi-vendor e-commerce platform for plants, seeds, and fertilizers etc.. Goal is to build a robust and prodcution-ready platform.

**CRITICAL CONSTRAINT:** The entire stack must run on a single 2 vCPU / 4GB RAM VPS. All architectural decisions prioritize low memory usage, stability, and "boring" technology over shiny or raw theoretical speed.

## 1. System Architecture

### HLD:

 - Django 6
 - Django REST Framework (DRF)
 - Modular Monolith

 A hypothetical structure:
    ```
    rooftop_nursery/
    ├── apps/
    │   ├── users/          # Custom user model, profiles
    │   │   ├── customers/          
    │   │   ├── vendors/
    │   ├── catalog/           # Products, categories, variants
    │   │   ├── categories/           
    │   │   ├── products/
    │   │   ├── variants/
    │   │   ├── images/         
    │   ├── inventory/         # Stock management, Logs (movements)
    │   ├── orders/            # Order processing, state machine
    │   ├── cart/              # Shopping cart (not needed now though)
    │   ├── checkout/          # Checkout flow, guest handling
    │   ├── payments/          # Payment gateway integration
    │   ├── shipping/          # Shipping methods, rate calculation
    │   ├── promotions/        # Coupons, discounts, campaigns
    │   ├── billing/           # Invoice generation, GST compliance
    │   ├── storefront/        # CMS-like customization
    │   ├── offline_orders/    # Manual order entry system
    │   ├── analytics/         # Basic reporting, dashboards
    │   └── webhooks/          # Webhook handling
    ├── infrastructure/
    ├── core/
    │   ├── middleware/
    │   ├── utils/
    │   ├── exceptions/
    │   └── validators/
    ├── config/                # Settings split by environment
    └── infrastructure/        # Deployment configs, scripts
    ```

### Infrastructure Strategy:

 - Hosting: A single VPS.
 - Storage: ImageKit Free Tier (Optimize image during upload to save free storage limits).
 - Database: PostgreSQL 18 (Tuned) (18 -> UUIDv7 support).
 - Caching: Redis (Cache & Queue).
 - Reverse Proxy: Nginx.
 - Payment Gateway: PhonePe.
 - Use Task Queues wherever necessary (Look at Django 6 Task feature).

### Application Components:

 - Backend: Django 6 + Django REST Framework (DRF) running via WSGI. (Open to discuss about ASGI scope and risks).
 - Storefront (Customer): TanStack Start (Node.js SSR(Selective)/ISR/Pre-rendered) - Optimized for SEO and UX.
 - Vendor Panel: Static React SPA (Vite) + (with some admin dashboard like Refine). Served as static files by Nginx (Zero RAM usage).
 - Admin Panel: Static React SPA (Vite) + (with some admin dashboard like Refine). Served as static files by Nginx (Zero RAM usage).
 (maybe merge Admin Panel and Vendor Panel into a single React app ?)

## 2. Design System: "Modern Botanical"

**Aesthetics:** Organic, premium, tactile (Seed packet vibe). NOT a generic SaaS dashboard.

### Color Palette:

 - Background: #FDFCF8 (Cream/Warm Paper)
 - Primary: #2F5233 (Forest Green - Buttons/Headers)
 - Secondary: #D5896F (Terracotta/Clay Pot)
 - Text: #2D2A26 (Soft Charcoal)
 - Accent: #76A84F (Leaf Green)

### Typography:
 - Headings: Playfair Display (Serif)
 - Body: Nunito (Sans-serif)

### UI Elements:

 - Cards: Polaroid-style, white background on cream, soft shadows, rounded-2xl.
 - Icons: Phosphor Icons.

## 3. Features & Key Decisions made so far:
    - The "Direct-to-Imagekit" Upload Flow (Non-Blocking) From Frontend.
    - Admin Panel (Owner Tools) - Theme, Page Builder (Landing, Hero Section, Category Grid, Featured Products, Promo Banner, Testimonials, Contact Form, Footer, CMS Pages, etc.), Schema, AI Copywriter, Invoicing.
    - Admin is also a Vendor.
    - All common features of Multivendor ecommerce system like:
        - Cart & Checkout (Thinking of Frontend-first (LocalStorage) using Zustand + Persist. Backend recalculates all prices from the DB at checkout. Trust no price sent from the frontend. Not Sync currently as Customer Login isn't mandatory for our shop.)
        - MultiRole Authentication
        - Payment Gateway (PhonePe)
        - Order Split
        - Guest Checkout (For frictionless checkout) (May be give chance of auto-login too? needs to think the flow.)
        - Invoicing: Uses WeasyPrint or something like that to generate PDF invoices with Indian GST context (IGST vs CGST/SGST logic).
        - AI Copywriter (Idea): some Custom widget integrating some AI to rewrite product descriptions inside the Admin would be great.
        - Vendors should be isolated from one another - RLS, and whatever else is needed.


### 4. Coding Standards & Directives

### DRF Optimization: 
* Always use select_related/prefetch_related. 
- Serializers might be better than ModelSerializer ?
- Use .values() + JsonResponse for high-volume Read-Only endpoints (bypass Serializers) ?
 - Use CursorPagination instead of PageNumberPagination.
- Async in Django?? unless absolutely necessary.
 - Vendor Isolation
 - Do all optimzations to mitigate notorious reputation of DRF.
 - Use services & selectors for all business logic (writes and reads).
 - View only handles API layer -> Controller.
 - Follow HackSoft Django Style Guide (https://github.com/HackSoftware/Django-Styleguide)


### 5. Database Schema

### DB Models so far
```python
class Category(TreeNodeModel, BaseModel):  # type: ignore
    display_field = "name"
    # api_login_required = False

    name = models.CharField(max_length=255)
    slug = models.SlugField(max_length=255, unique=True)
    code = models.CharField(max_length=255, unique=True)
    is_active = models.BooleanField(default=True)
    # parent_id = models.ForeignKey(
    #     "self", on_delete=models.SET_NULL, null=True, blank=True
    # )
    image_url = models.CharField(max_length=255, blank=True, null=True)

class UUIDv7(models.Func):
    function = "uuidv7"
    output_field = models.UUIDField()  # type: ignore


class UUIDModel(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid7, editable=False)

    class Meta:
        abstract = True


class TimeStampedModel(models.Model):
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True


class BaseModel(UUIDModel, TimeStampedModel, SoftDeleteModel):
    class Meta:  # type: ignore
        abstract = True

class Coupon(BaseModel):
    class DiscountType(models.TextChoices):
        PERCENTAGE = "PERCENTAGE", "Percentage"
        FIXED = "FIXED", "Fixed"

    code = models.CharField(max_length=50, unique=True)
    description = models.TextField()
    discount_type = models.CharField(max_length=20, choices=DiscountType.choices)
    discount_value = models.FloatField()
    min_order_amount = models.FloatField()
    max_discount_amount = models.FloatField(null=True, blank=True)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    usage_limit = models.PositiveIntegerField()
    usage_limit_per_user = models.PositiveIntegerField()
    applies_to_all_products = models.BooleanField(default=False)
    applies_to_specific_products = models.ManyToManyField(
        "products.ProductVariant", blank=True, related_name="coupons", null=True
    )
    is_active = models.BooleanField(default=True)

class Customer(BaseModel):
    user = models.ForeignKey(
        "users.User", on_delete=models.CASCADE, null=True, blank=True
    )
    is_active = models.BooleanField(default=True)
    is_guest = models.BooleanField(default=False)

    class Meta(BaseModel.Meta):
        verbose_name = "Customer"
        verbose_name_plural = "Customers"


class Address(BaseModel):
    class AddressType(models.TextChoices):
        SHIPPING = "shipping", _("Shipping")
        BILLING = "billing", _("Billing")

    customer = models.ForeignKey(
        "customers.Customer", on_delete=models.CASCADE, null=True, blank=True
    )
    type = models.CharField(max_length=255, choices=AddressType.choices)
    full_name = models.CharField(max_length=255)
    phone = models.CharField(max_length=255)
    email = models.EmailField(null=True, blank=True)
    address = models.TextField()
    city = models.CharField(max_length=255, null=True, blank=True)
    state = models.CharField(max_length=255, null=True, blank=True)
    country = models.CharField(max_length=255, null=True, blank=True, default="India")
    pin_code = models.CharField(max_length=6)
    is_default = models.BooleanField(default=False)

class ProductImage(BaseModel):
    variant = models.ForeignKey(
        "products.ProductVariant", on_delete=models.SET_NULL, null=True
    )
    image_url = models.URLField()
    image_provider_id = models.CharField(max_length=255, blank=True, null=True)
    is_display_image = models.BooleanField(default=False)
    display_order = models.PositiveIntegerField()

    class Meta(BaseModel.Meta):
        unique_together = ["variant", "display_order"]

class Stock(BaseModel):
    variant = models.OneToOneField("products.ProductVariant", on_delete=models.CASCADE, related_name="stock")
    quantity = models.PositiveIntegerField()
    reserved_quantity = models.PositiveIntegerField(default=0)
    low_stock_threshold = models.PositiveIntegerField(default=0)

    available_quantity = models.GeneratedField(
        expression=F("quantity") - F("reserved_quantity"),
        output_field=models.PositiveIntegerField(),
        db_persist=True,
    )

    def __str__(self):
        return f"{self.variant.product.name} - {self.variant.name}"


class InventoryLog(BaseModel):
    class InventoryAction(models.TextChoices):
        SALE = "sale"
        RESTOCK = "restock"
        RETURN = "return"
        ADJUSTMENT = "adjustment"
        RESERVE = "reserve"

    variant = models.ForeignKey("products.ProductVariant", on_delete=models.CASCADE)
    change_quantity = models.IntegerField()  # +ve for sale, -ve for return
    action_type = models.CharField(
        max_length=255,
        choices=InventoryAction.choices,
        default=InventoryAction.SALE,
    )
    reference_id = models.UUIDField(null=True, blank=True)
    reference_type = models.CharField(
        max_length=255, null=True, blank=True
    )  # order, return
    previous_quantity = models.PositiveIntegerField()
    current_quantity = models.GeneratedField(
        expression=F("previous_quantity") + F("change_quantity"),
        output_field=models.PositiveIntegerField(),
        db_persist=True,
    )

class Order(BaseModel):
    customer = models.ForeignKey(
        "customers.Customer", on_delete=models.SET_NULL, null=True
    )
    order_number = models.CharField(max_length=255, unique=True)
    total_quantity = models.PositiveIntegerField()
    subtotal_amount = models.DecimalField(max_digits=10, decimal_places=2)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_amount = models.DecimalField(max_digits=10, decimal_places=2)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2)
    grand_total = models.DecimalField(max_digits=10, decimal_places=2)
    shipping_address = models.JSONField(default=dict)
    billing_address = models.JSONField(default=dict, null=True, blank=True)
    status = models.CharField(
        max_length=255, choices=OrderStatus.choices, default=OrderStatus.PENDING
    )
    payment_status = models.CharField(
        max_length=255, choices=PaymentStatus.choices, default=PaymentStatus.PENDING
    )
    coupon_code_applied = models.CharField(max_length=255, null=True, blank=True)
    notes = models.TextField(null=True, blank=True)

    confirmed_at = models.DateTimeField(null=True, blank=True)
    shipped_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancellation_reason = models.TextField(null=True, blank=True)

    def __str__(self):
        return f"Order #{self.order_number} by {self.shipping_address.get('full_name')}"

    class Meta(BaseModel.Meta):
        unique_together = ("order_number", "customer")
        indexes = [
            models.Index(fields=["order_number"], name="idx_order_number"),
            models.Index(fields=["customer"], name="idx_order_customer"),
        ]

    def save(self, *args, **kwargs):
        if not self.order_number:
            self.order_number = f"ORD-{self.id}"
        super().save(*args, **kwargs)


class OrderItem(BaseModel):
    order = models.ForeignKey("orders.Order", on_delete=models.CASCADE)
    variant = models.ForeignKey("products.ProductVariant", on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    # product_snapshot = product, variant, current price, sku
    product_snapshot = models.JSONField(default=dict)
    tax_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    discount_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    total_amount = models.DecimalField(max_digits=10, decimal_places=2)

    vendor = models.ForeignKey("vendors.Vendor", on_delete=models.SET_NULL, null=True)

    is_refunded = models.BooleanField(default=False)
    fulfillment_status = models.CharField(
        max_length=255, choices=OrderStatus.choices, default=OrderStatus.PENDING
    )

    shipped_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    delivered_at = models.DateTimeField(null=True, blank=True)
    cancellation_reason = models.TextField(null=True, blank=True)

    vendor_payout_amount = models.DecimalField(
        max_digits=10, decimal_places=2, default=0.0
    )
    vendor_payout_status = models.CharField(
        max_length=255, choices=PaymentStatus.choices, default=OrderStatus.PENDING
    )
    tracking_number = models.CharField(max_length=255, null=True, blank=True)

    class Meta(BaseModel.Meta):
        unique_together = ("order", "variant")
        indexes = [
            models.Index(fields=["order"], name="idx_order_item_order"),
            models.Index(fields=["variant"], name="idx_order_item_variant"),
        ]

class Payment(BaseModel):
    order = models.ForeignKey("orders.Order", on_delete=models.CASCADE)
    gateway_order_id = models.CharField(max_length=255)
    gateway_transaction_id = models.CharField(max_length=255)
    payment_method = models.CharField(max_length=50)
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    status = models.CharField(
        max_length=20, choices=PaymentStatus.choices, default=PaymentStatus.PENDING
    )
    gateway_response = models.JSONField()
    failure_reason = models.TextField(null=True, blank=True)

    paid_at = models.DateTimeField(null=True, blank=True)
    refunded_at = models.DateTimeField(null=True, blank=True)
    refund_amount = models.DecimalField(max_digits=10, decimal_places=2, default=0.0)
    idempotency_key = models.CharField(max_length=255, unique=True)
    attempt_count = models.PositiveIntegerField(default=1)
    last_attempted_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"Payment for Order #{self.order.order_number}"

    def save(self, *args, **kwargs):
        if not self.idempotency_key:
            self.idempotency_key = self.generate_idempotency_key()
        super().save(*args, **kwargs)

    @staticmethod
    def generate_idempotency_key():
        import uuid

        return str(uuid.uuid4())

    class Meta(BaseModel.Meta):
        unique_together = ("order", "gateway_order_id")
        indexes = [
            models.Index(fields=["order"], name="idx_payment_order"),
            models.Index(
                fields=["gateway_order_id"], name="idx_payment_gateway_order_id"
            ),
        ]

class Product(BaseModel):
    """
    Base Product (For Overview details only)
    """

    name = models.CharField(max_length=255)
    slug = models.SlugField(unique=True)
    description = models.TextField()
    attributes = models.JSONField(default=dict)
    tags = models.JSONField(default=list)

    vendor = models.ForeignKey("vendors.Vendor", on_delete=models.CASCADE)
    category = models.ManyToManyField("categories.Category", related_name="products")

    is_active = models.BooleanField(default=True)
    # is_featured = models.BooleanField(default=False)
    # TODO suggest in frontend
    # def save(self, *args, **kwargs):
    #     if not self.sku:
    #         self.sku = self.slug
    #     super().save(*args, **kwargs)

    # create base variant

    class Meta(BaseModel.Meta):
        unique_together = ["name", "vendor"]
        indexes = [
            models.Index(fields=["name", "vendor"], name="idx_product_name_vendor"),
            models.Index(fields=["is_active"], name="idx_product_is_active"),
        ]

    def __str__(self):
        return self.name


class ProductVariant(BaseModel):
    """
    Sellable Entities
    """

    product = models.ForeignKey("products.Product", on_delete=models.CASCADE)
    name = models.CharField(max_length=255)
    sku = models.CharField(max_length=255, unique=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    mrp = models.DecimalField(max_digits=10, decimal_places=2)  # Compared Price
    cost_price = models.DecimalField(
        max_digits=10, decimal_places=2
    )  # For Internal Profit Calculation
    display_order = models.PositiveIntegerField()
    weight_grams = models.PositiveIntegerField()
    unit = models.CharField(max_length=255)
    unit_value = models.DecimalField(max_digits=10, decimal_places=2)

    is_active = models.BooleanField(default=True)
    is_single_unit = models.BooleanField(default=False)

    class Meta(BaseModel.Meta):
        unique_together = ["product", "sku"]
        indexes = [
            models.Index(fields=["product", "sku"], name="idx_product_variant_sku"),
            models.Index(fields=["is_active"], name="idx_product_variant_is_active"),
            models.Index(
                fields=["product", "display_order"],
                name="idx_product_image_order",
            ),
            models.Index(fields=["product"], name="idx_product_variant_product"),
        ]

    # def save(self, *args, **kwargs):
    #     if self.is_single_unit:
    #         if ProductVariant.objects.filter(product=self.product).count() >= 1:
    #             return

    #     super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.product.name} - {self.name}"

class ProductReview(BaseModel):
    product = models.ForeignKey("products.Product", on_delete=models.CASCADE)
    # variant = models.ForeignKey(ProductVariant, on_delete=models.SET_NULL, null=True)
    customer = models.ForeignKey("customers.Customer", on_delete=models.CASCADE)
    reviewer_name = models.CharField(max_length=255)
    rating = models.PositiveIntegerField()
    comment = models.TextField()
    body = models.TextField()
    is_verified = models.BooleanField(default=False)

    def __str__(self):
        return f"Review for {self.product.name} by {self.customer.full_name}"

    class Meta(BaseModel.Meta):
        unique_together = ["product", "customer"]
        indexes = [
            models.Index(fields=["product", "customer"], name="idx_product_customer")
        ]
class Banner(BaseModel):
    class PositionType(models.TextChoices):
        HERO_SLIDER = "HERO_SLIDER", "Hero Slider"
        SIDEBAR_AD = "SIDEBAR_AD", "Sidebar Ad"
        FOOTER = "FOOTER", "Footer"

    title = models.CharField(max_length=100, null=True, blank=True)
    image_url = models.URLField()
    mobile_image_url = models.URLField(null=True, blank=True)
    link_url = models.URLField()
    position_type = models.CharField(max_length=20, choices=PositionType.choices)
    start_date = models.DateTimeField()
    end_date = models.DateTimeField()
    sort_order = models.PositiveIntegerField()
    is_active = models.BooleanField(default=True)

    class Meta(BaseModel.Meta):
        ordering = ["-created_at"]


class StorefrontSetting(BaseModel):
    key = models.CharField(
        max_length=50, unique=True
    )  # site_title, support_phone, tax_rate, shipping_threshold
    value = models.TextField()
    type = models.CharField(max_length=20)  # string, boolean, number, json
    description = models.TextField()
    is_active = models.BooleanField(default=True)
class User(BaseModel, AbstractBaseUser, PermissionsMixin):
    class UserRoles(models.TextChoices):
        SUPER_ADMIN = "super_admin"
        ADMIN = "admin"
        CUSTOMER = "customer"
        VENDOR = "vendors"

    email = models.EmailField(unique=True)
    phone = models.CharField(max_length=20, unique=True)
    full_name = models.CharField(max_length=255)
    role = models.CharField(
        max_length=20,
        choices=UserRoles,
        default=UserRoles.CUSTOMER,
    )

    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)

    USERNAME_FIELD = "phone"
    REQUIRED_FIELDS = ["email"]

    objects = UserManager()
class UserManager(BaseUserManager):
    def _create_user_object(
        self, phone=None, email=None, role=None, password=None, **extra_fields
    ):
        # if not password:
        #     raise ValueError("Password must be provided")

        if not (email or phone):
            raise ValueError("Either phone or email must be provided")


        role = role or self.model.UserRoles.CUSTOMER

        if email:
            email = self.normalize_email(email)

        user = self.model(phone=phone, email=email, role=role, **extra_fields)
        user.set_password(password)
        return user

    def _create_user(self, phone=None, email=None, role=None, password=None, **extra_fields):
        user = self._create_user_object(phone, email, role, password, **extra_fields)
        user.save(using=self._db)
        return user

    async def _acreate_user(self, phone=None, email=None, role=None, password=None, **extra_fields):
        user = self._create_user_object(phone, email, role, password, **extra_fields)
        await user.asave(using=self._db)
        return user

    def create_user(self, phone=None, email=None, role=None, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return self._create_user(phone, email, role, password, **extra_fields)

    create_user.alters_data = True

    async def acreate_user(self, phone=None, email=None, role=None,password=None, **extra_fields):
        extra_fields.setdefault("is_staff", False)
        extra_fields.setdefault("is_superuser", False)
        return await self._acreate_user(phone, email, role,password, **extra_fields)

    acreate_user.alters_data = True

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault(
            "role", "super_admin"
        )

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return self._create_user(email=email, password=password, **extra_fields)

    create_superuser.alters_data = True

    async def acreate_superuser(
        self, email=None, password=None, **extra_fields
    ):
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", True)
        extra_fields.setdefault("role", self.model.roles.SUPER_ADMIN)

        if extra_fields.get("is_staff") is not True:
            raise ValueError("Superuser must have is_staff=True.")
        if extra_fields.get("is_superuser") is not True:
            raise ValueError("Superuser must have is_superuser=True.")

        return await self._acreate_user(email=email, password=password, **extra_fields)

    acreate_superuser.alters_data = True

    def create_staffuser(self, email=None, password=None, **extra_fields):
        extra_fields.setdefault("role", self.model.roles.ADMIN)
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", False)

        return self._create_user(email=email, password=password, **extra_fields)

    async def acreate_staffuser(self, email=None, password=None, **extra_fields):
        extra_fields.setdefault("role", self.model.roles.ADMIN)
        extra_fields.setdefault("is_staff", True)
        extra_fields.setdefault("is_superuser", False)

        return await self._acreate_user(email=email, password=password, **extra_fields)

class Vendor(BaseModel):
    user = models.ForeignKey("users.User", on_delete=models.CASCADE)
    business_name = models.CharField(max_length=255)
    # email and phone will come from user
    commission_rate = models.DecimalField(max_digits=5, decimal_places=2)
    is_approved = models.BooleanField(default=False)
    approved_at = models.DateTimeField(null=True, blank=True)
class WebhookEvents(BaseModel):
    event_type = models.CharField(max_length=255)
    payload = models.JSONField()
    processed = models.BooleanField(default=False)
    processing_error = models.TextField(null=True, blank=True)
```