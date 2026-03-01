from django.contrib import admin

# Register your models here.
from .models.product import Product, ProductVariant

# from .models.review import ProductReview

admin.site.register(Product)
admin.site.register(ProductVariant)

# admin.site.register(ProductReview)
