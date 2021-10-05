from django.db import models
from django.contrib.auth.models import AbstractUser

# Create your models here.
class User(AbstractUser):
    pass


class Trip(models.Model):
    origen = models.ForeignKey('Ubicacion', on_delete=models.DO_NOTHING, related_name="origen")
    destino = models.ForeignKey('Ubicacion', on_delete=models.DO_NOTHING, related_name="destino")
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    vehicle = models.CharField(max_length=10, null=True)
    mapa = models.ImageField(upload_to='trips', null=True)
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    polyline = models.TextField(null=True)

    def __str__(self) -> str:
        return f'viaje: {self.origen} - {self.destino}'

    class Meta:
        ordering =['-date_created']


class Ubicacion(models.Model):
    place_id = models.TextField(primary_key=True)
    name = models.TextField()
    formatted_address = models.TextField()
    locality = models.CharField(max_length=80, null=True)
    adm_area_lv2 = models.CharField(max_length=80)
    adm_area_lv1 = models.CharField(max_length=80)
    date_created = models.DateTimeField(auto_now_add=True)
    date_modified = models.DateTimeField(auto_now=True)
    

    def __str__(self) -> str:
        return self.name