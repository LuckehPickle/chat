# [Docs] VIEWS.PY - Copyright (c) 2016 - Sean Bailey - All Rights Reserved
# Powered by Django (https://www.djangoproject.com/) - Not endorsed by Django
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.

# Django Imports
from django.contrib import messages
from django.http import HttpResponse
from django.shortcuts import render, redirect, get_object_or_404

# Other Imports
import cr_config as config


def index(request):
    """
    """
    user_id = None
    if request.user.is_authenticated():
        user_id = str(request.user.user_id)[:8]

    return render(request, "docs/index.html", {
        "title": (config.TITLE_FORMAT % "Documentation"),
        "user_id": user_id,
    })

def category(request, category, slug=None):
    return HttpResponse("Category: {0}, Slug: {1}".format(category, slug))
