from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.http.response import HttpResponse, JsonResponse
from django.shortcuts import HttpResponseRedirect, render
from django.urls import reverse

from .models import User, Trip, Ubicacion
from . import utils
import json

# Create your views here.
# Create your views here.

def index(request):
    trips = Trip.objects.all()[:4]
    return render(request, 'trips/index.html', {'trips': trips})


def find(request):
    mode = request.GET.get('mode')
    if  mode == 'filter':
        origen = request.GET.get('origen')
        destino = request.GET.get('destino')
        if origen and destino:
            trips = [trip.serialize() for trip in Trip.objects.filter(origen__adm_area_lv2=origen, destino__adm_area_lv2=destino)]
        elif origen: 
            trips = [trip.serialize() for trip in Trip.objects.filter(origen__adm_area_lv2=origen)]
        elif destino:
            trips = [trip.serialize() for trip in Trip.objects.filter(destino__adm_area_lv2=destino)]
        else:
            trips = [trip.serialize() for trip in Trip.objects.all()]
        if trips:
            return JsonResponse({'message': 'Trips found', 'trips': trips})
        else:
            return JsonResponse({'message': 'No trips found', 'trips': []})
    elif mode == 'all':
        trips = [trip.serialize() for trip in Trip.objects.all()]
        origenes = list(set([origen for origen in Trip.objects.order_by('origen__adm_area_lv2').values_list('origen__adm_area_lv2', flat=True) if origen is not None]))
        destinos = list(set([destino for destino in Trip.objects.values_list('destino__adm_area_lv2', flat=True) if destino is not None]))
        origenes.sort()
        destinos.sort()
        return JsonResponse({
            'message': 'Trips found', 
            'trips': trips, 
            'origenes': origenes, 
            'destinos': destinos
            })
    return render(request, 'trips/find.html')

@login_required
def my_trips(request):
    trips = Trip.objects.filter(user=request.user)
    return render(request, 'trips/my_trips.html', {'trips': trips})


def trip_view(request, id):
    if request.method == "DELETE":
        try:    
            data = json.loads(request.body)
            trip = Trip.objects.get(pk=data.get('id'))
            trip.delete()
            messages.success(request, 'Viaje eliminado con exito!')
        except:
            messages.error(request, 'Viaje no pudo ser eliminado!')
        return HttpResponse(status=200)
    trip = Trip.objects.get(pk=id)
    return render(request, 'trips/trip.html', {'trip': trip})

@login_required
def profie(request):
    pass


@login_required
def publish_trip(request):
    if request.method == 'POST':
        data = json.loads(request.body)
        origen_addr_component = utils.parse_address(data['origin']["address_components"])
        dest_addr_component = utils.parse_address(data['dest']["address_components"])
        try:
            origen = Ubicacion.objects.create(
            place_id=data['origin']['place_id'],
            name=data['origin']['name'],
            formatted_address=data['origin']['formatted_address'],
            locality=origen_addr_component.get('locality', None),
            adm_area_lv2 =origen_addr_component.get('administrative_area_level_2', None),
            adm_area_lv1 =origen_addr_component.get('administrative_area_level_1', None)
            )
            origen.save()
        except IntegrityError:
            origen = Ubicacion.objects.get(pk=data['origin']['place_id'])
        try:
            destino = Ubicacion.objects.create(
            place_id=data['dest']['place_id'],
            name=data['dest']['name'],
            formatted_address=data['dest']['formatted_address'],
            locality=dest_addr_component.get('locality', None),
            adm_area_lv2 =dest_addr_component.get('administrative_area_level_2', None),
            adm_area_lv1 =dest_addr_component.get('administrative_area_level_1', None)
            )
            destino.save()
        except IntegrityError:
            destino = Ubicacion.objects.get(pk=data['dest']['place_id'])
        trip = Trip.objects.create(
            origen = origen,
            destino = destino,
            user = request.user,
            vehicle = data.get('vehiculo', None),
            polyline=data.get('polyline', None)
            )
        trip.save()
        messages.success(request, 'Viaje creado con exito!')
        return HttpResponse(status=201)
        #return HttpResponseRedirect(reverse('index'))
    return render(request, 'trips/publish.html')

@login_required
def log_out(request):
    logout(request)
    return HttpResponseRedirect(reverse("index"))

def log_in(request):
    if request.method == "POST":
        username = request.POST.get('username')
        password = request.POST.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            return HttpResponseRedirect(reverse("index"))
        else:
            messages.error(request, 'Incorrect username or password!')
    return render(request, 'trips/login.html')

def register(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        confirm = request.POST.get("confirm")
        if not username or not password:
            messages.error(request, 'Usuario incorrecto!')
        elif password != confirm:
            messages.error(request, 'Contrasenas deben coincidir!')
        try:
            user = User.objects.create_user(username, password=password)
            user.save()
            messages.success(request, 'Usuario creado con exito!')
            return HttpResponseRedirect(reverse("login"))
        except IntegrityError as e:
            messages.error(request, 'Usuario ya existe!')
    return render(request, 'trips/register.html')