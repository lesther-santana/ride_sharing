from django.urls import path

from . import views

urlpatterns = [
    path("", views.index, name="index"),
    path('register', views.register, name="register"),
    path('login', views.log_in, name="login"),
    path('logout', views.log_out, name="logout"),
    path('find', views.find, name="find"),
    path('publish', views.publish_trip, name="publish"),
    path('my-trips', views.my_trips, name="my-trips"),
    path('trip/<int:id>', views.trip_view, name="trip")
]