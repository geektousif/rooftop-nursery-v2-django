"""
Admin URLs for Coupons app - endpoints for authenticated admins.
"""
from django.urls import path

app_name = 'coupons_admin'

urlpatterns = [
    # Admin coupon management
    path('', views.CouponAdminListAPIView.as_view(), name='admin_coupons'),
    path('', views.CouponAdminCreateAPIView.as_view(), name='admin_coupon_create'),
    path('<uuid:coupon_id>/', views.CouponAdminDetailAPIView.as_view(), name='admin_coupon_detail'),
    path('<uuid:coupon_id>/update/', views.CouponAdminUpdateAPIView.as_view(), name='admin_coupon_update'),
    path('<uuid:coupon_id>/delete/', views.CouponAdminDeleteAPIView.as_view(), name='admin_coupon_delete'),
    path('<uuid:coupon_id>/activate/', views.CouponAdminActivateAPIView.as_view(), name='admin_coupon_activate'),
    path('<uuid:coupon_id>/deactivate/', views.CouponAdminDeactivateAPIView.as_view(), name='admin_coupon_deactivate'),
]