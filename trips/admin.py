from django.contrib import admin
from .models import User, Trip, Ubicacion

# Register your models here.
admin.site.register(User)
admin.site.register(Trip)
admin.site.register(Ubicacion)