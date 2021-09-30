from django.contrib import messages
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.db import IntegrityError
from django.shortcuts import HttpResponseRedirect, render
from django.urls import reverse

from .models import User

# Create your views here.
# Create your views here.

def index(request):
    return render(request, 'trips/index.html')


@login_required
def trips(request):
    pass


@login_required
def profie(request):
    pass


@login_required
def publish_trip(request):
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
        return HttpResponseRedirect(reverse("login"))
    return render(request, 'trips/login.html')

def register(request):
    if request.method == "POST":
        username = request.POST.get("username")
        password = request.POST.get("password")
        confirm = request.POST.get("confirm")
        if not username or not password:
            messages.error(request, 'Usuario incorrecto!')
            return HttpResponseRedirect(reverse("register"))
        elif password != confirm:
            messages.error(request, 'Contrasenas deben coincidir!')
            return HttpResponseRedirect(reverse("register"))
        try:
            user = User.objects.create_user(username, password=password)
            user.save()
            messages.success(request, 'Usuario creado con exito!')
            return HttpResponseRedirect(reverse("login"))
        except IntegrityError as e:
            messages.error(request, 'Usuario ya existe!')
            return HttpResponseRedirect(reverse("register"))
    return render(request, 'trips/register.html')
