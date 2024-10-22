from django.shortcuts import render, redirect
from django.contrib.auth.views import LoginView
from .forms import SignUpForm

def registro(request):
    if request.method == 'POST':
        form = SignUpForm(request.POST)
        if form.is_valid():
            form.save()
            return redirect('index')
    else:
        form = SignUpForm()
    return render(request, 'registre.html', {'form': form})
