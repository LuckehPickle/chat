# [Messages] MODELS.PY - Copyright (c) 2016 - Sean Bailey - All Rights Reserved
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
from django.db import models
from django.utils import timezone
from django.core.urlresolvers import reverse

# Other Imports
import uuid
from . import identifier as ident

# Chat Group Class
# Represents the database model that each chatgroup, public or private,
# must adopt.
class ChatGroup(models.Model):

    # The name can be changed at anytime by the rooms moderators.
    # Does not have to be unique, and should not be use as the primary
    # key.
    name = models.CharField(max_length=32)

    # This ID is a unique 7 character base64 string, that is
    # generated by identifier.py. It can be changed to any unique string
    # of base64 characters by premium moderators in public chats. The
    # identifier is also used as the absolute url of any chat when
    # sluggified. For example: https://cometchat.cc/custom-identifier
    group_id = models.CharField(
        unique=True,
        primary_key=True,
        max_length=20,
        default=ident.generate,
    )

    # Self explanatory
    date_created = models.DateTimeField(default=timezone.now)

    # Should the chat room be accesssible to the public? If true, then
    # anyone with the absolute url can join the chat room.
    is_public = models.BooleanField(default=False)

    users = models.ManyToManyField(
        "accounts.User",
        through="ChatPermissions",
        through_fields=("chat_group", "user"),
        related_name="+",
    )

    last_message = models.DateTimeField(default=timezone.now)

    def __unicode__(self):
        return str(self.name)

    #@models.permalink
    def get_absolute_url(self):
        return reverse("messenger.views.group", args=[str(self.group_id)])
        #return "/messages/%s" % str(self.identifier)

class ChatPermissions(models.Model):
    # The group that these permissions apply to
    chat_group = models.ForeignKey(
        ChatGroup,
        on_delete=models.CASCADE,
    )

    # The user whose permissions apply
    user = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
    )

    # Creator's have elavated permissions compared to moderators.
    is_creator = models.BooleanField(default=False)

    # Is the user a moderator of this group. This field is ignored if the user is a creator
    is_moderator = models.BooleanField(default=False)

    # Tracks whether the user is currently muted. Muted users can appeal their mute to
    # moderators, but only once per set amount of time.
    is_muted = models.BooleanField(default=False)

    # Tracks whether the user has been banned, preventing them from connecting.
    is_banned = models.BooleanField(default=False)

    # Tracks the reason for the ban, to be relayed to the user on a failed connect.
    ban_reason = models.CharField(
        blank=True,
        max_length=120,
    )

class ChatInvite(models.Model):
    # The user that received the invite
    recipient = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="group_recipient",
    )

    # The user that sent the invite
    sender = models.ForeignKey(
        "accounts.User",
        on_delete=models.CASCADE,
        related_name="group_sender",
    )

    # The group that the recipient was invited to
    group = models.ForeignKey(
        "ChatGroup",
        on_delete=models.CASCADE,
    )
