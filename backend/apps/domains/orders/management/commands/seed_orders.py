from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone

from apps.orders.models import Order, OrderItem, OrderStatus, PaymentStatus
from apps.customers.models import Customer
from apps.products.models import ProductVariant
from apps.vendors.models import Vendor


class Command(BaseCommand):
    help = "Seed orders data"

    def add_arguments(self, parser):
        parser.add_argument(
            "--count",
            type=int,
            default=5,
            help="Number of orders to create",
        )

    def handle(self, *args, **options):
        count = options["count"]
        self.stdout.write(f"Creating {count} orders...")

        customers = Customer.objects.filter(is_active=True)
        variants = ProductVariant.objects.filter(is_active=True)
        vendors = Vendor.objects.filter(is_approved=True)

        if not customers.exists():
            self.stdout.write(
                self.style.WARNING(
                    "No customers found. Please run seed_customers first."
                )
            )
            return

        if not variants.exists():
            self.stdout.write(
                self.style.WARNING(
                    "No product variants found. Please run seed_products first."
                )
            )
            return

        created_count = 0
        for i in range(count):
            customer = customers[i % customers.count()]
            variant = variants[i % variants.count()]
            vendor = vendors.first() if vendors.exists() else None

            # Calculate order amounts
            quantity = 2
            unit_price = variant.price
            subtotal = unit_price * quantity
            tax_amount = subtotal * Decimal("0.18")  # 18% tax
            shipping_amount = Decimal("50.00") if subtotal < Decimal("500.00") else Decimal("0.00")
            discount_amount = Decimal("0.00")
            grand_total = subtotal + tax_amount + shipping_amount - discount_amount

            order = Order.objects.create(
                customer=customer,
                order_number=f"ORD-{timezone.now().strftime('%Y%m%d')}-{i+1:04d}",
                total_quantity=quantity,
                subtotal_amount=subtotal,
                tax_amount=tax_amount,
                shipping_amount=shipping_amount,
                discount_amount=discount_amount,
                grand_total=grand_total,
                shipping_address={
                    "full_name": customer.user.full_name if customer.user else "Customer",
                    "phone": customer.user.phone if customer.user else "",
                    "address": "123 Main Street",
                    "city": "Mumbai",
                    "state": "Maharashtra",
                    "country": "India",
                    "pin_code": "400001",
                },
                billing_address={
                    "full_name": customer.user.full_name if customer.user else "Customer",
                    "phone": customer.user.phone if customer.user else "",
                    "address": "123 Main Street",
                    "city": "Mumbai",
                    "state": "Maharashtra",
                    "country": "India",
                    "pin_code": "400001",
                },
                status=OrderStatus.PLACED if i % 2 == 0 else OrderStatus.PENDING,
                payment_status=PaymentStatus.PAID if i % 2 == 0 else PaymentStatus.PENDING,
            )

            # Create order item
            OrderItem.objects.create(
                order=order,
                variant=variant,
                quantity=quantity,
                unit_price=unit_price,
                product_snapshot={
                    "product_name": variant.product.name,
                    "variant_name": variant.name,
                    "sku": variant.sku,
                    "price": str(unit_price),
                },
                tax_amount=tax_amount,
                discount_amount=discount_amount,
                total_amount=subtotal + tax_amount - discount_amount,
                vendor=vendor,
                fulfillment_status=OrderStatus.PLACED if i % 2 == 0 else OrderStatus.PENDING,
            )

            created_count += 1
            self.stdout.write(
                self.style.SUCCESS(f"Created order: {order.order_number}")
            )

        self.stdout.write(
            self.style.SUCCESS(f"Successfully created {created_count} orders")
        )
        self.stdout.write(self.style.SUCCESS("Orders seeding completed!"))