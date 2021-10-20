from django.contrib import admin
from .models import User, Trip, Ubicacion, Mensaje, Convo

# Register your models here.
admin.site.register(User)
admin.site.register(Trip)
admin.site.register(Ubicacion)
admin.site.register(Mensaje)
admin.site.register(Convo)