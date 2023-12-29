
from django.contrib import admin
from django.urls import path, include
from base import views

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', include('base.urls')),

    path('get_token/', views.get_token),

    path('create_member/', views.create_user),
    path('get_member/', views.get_member),
    path('delete_member/', views.delete_member),
]
