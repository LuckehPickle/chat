/**
 * @license Copyright (c) 2016 - Sean Bailey - All Rights Reserved
 * Looking for source code? Check it out here: https://github.com/LuckehPickle/Comet
 */

/**
 * Copyright (c) 2016 - Sean Bailey - All Rights Reserved
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/** @const */ var NAMESPACE = "messenger";
/** @const */ var SEARCH_TYPING_INTERVAL = 100; // How long should typing last (milliseconds)
/** @const */ var PUSH_TIMEOUT = 8000;
var createModal;
var searchTimer;

/**
 * Animations
 */
var channelListIn = anime({
    targets: ".channel-list",
    duration: 100,
    easing: "easeInCubic",
    autoplay: false,
    top: ["100%", 0],
    opacity: [0, 1],
});

var channelListOut = anime({
    targets: ".channel-list",
    duration: 100,
    easing: "easeInCubic",
    autoplay: false,
    top: [0, "100%"],
    opacity: [1, 0],
});

var channelInfoIn = anime({
    targets: ".channel-info",
    duration: 100,
    easing: "easeInCubic",
    autoplay: false,
    top: ["100%", 0],
    opacity: [0, 1],
});

var channelInfoOut = anime({
    targets: ".channel-info",
    duration: 100,
    easing: "easeInCubic",
    autoplay: false,
    top: [0, "100%"],
    opacity: [1, 0],
});


/**
 * Init Messenger
 * Initialises messenger related functions.
 * @param {Boolean} fullLoad Determines whether the page was a PJAX load.
 */
function initMessenger(fullLoad){
    if(createModal == null)
        createModal = new Modal("create", $(".modal-create"));

    if(!fullLoad){ // If this is a PJAX load we only want to add event handlers.
        addMessengerEventListeners(fullLoad);
        return;
    }

    print("Initialising Messenger...");

    scrollToBottom($(".chat-body"));
    addMessengerEventListeners(fullLoad);

    print("Initialised Messenger.");
}


/**
 * Add Messenger Event Listeners
 * Initialises event listeners for things on the messenger page.
 * @param {Boolean} fullLoad Determines whether the page was a PJAX load.
 */
function addMessengerEventListeners(fullLoad){

    /* BEGIN CREATE MODAL */
    var createTrigger = $(".create-group");
    createTrigger.off("." + NAMESPACE);
    createTrigger.on("click." + NAMESPACE, function(){
        if(createModal == null)
            createModal = new Modal("create", $(".modal-create"));
        createModal.display();
    });

    var createCancel = $(".modal-create-cancel");
    createCancel.off("." + NAMESPACE);
    createCancel.on("click." + NAMESPACE, function(){
        createModal.hide();
    });
    /* END CREATE MODAL */

    /* BEGIN CHAT */
    var input = $(".messenger-input");
    input.off("." + NAMESPACE);
    input.on("keydown." + NAMESPACE, function(event){
        if(event.which == 13 && !(event.shiftKey)){
            handleMessengerInput(input.text());
            input.text("");
            return false;
        }
    });

    var placeholder = $(".messenger-input-placeholder");
    input.on("focus." + NAMESPACE, function(){
        placeholder.hide();
    });

    input.on("blur." + NAMESPACE, function(){
        if(!input.text().length){ // Only show if empty
            placeholder.show();
        }
    });
    /* END CHAT */

    /* BEGIN TABS */
    var openChannelTab = $(".open-channel-tab");
    var channelList = $(".channel-list");
    openChannelTab.off("." + NAMESPACE);
    openChannelTab.on("click." + NAMESPACE, function(){
        channelListIn.play();
        channelList.attr("active", "");
    });

    var closeChannelTab = $(".channel-tab-back");
    closeChannelTab.off("." + NAMESPACE);
    closeChannelTab.on("click." + NAMESPACE, function(){
        channelListOut.play();
        channelList.removeAttr("active");
    });

    var openInfoTab = $(".open-info-tab");
    var channelInfo = $(".channel-info");
    openInfoTab.off("." + NAMESPACE);
    openInfoTab.on("click." + NAMESPACE, function(){
        channelInfoIn.play();
        channelInfo.attr("active", "");
    });

    var closeInfoTab = $(".channel-info");
    closeInfoTab.off("." + NAMESPACE);
    closeInfoTab.on("click." + NAMESPACE, function(){
        channelInfoOut.play();
        channelInfo.removeAttr("active");
    });
    /* END TABS */

    /* BEGIN CHANNEL LIST */
    var channelWrappers = $(".chnl-wrapper");
    channelWrappers.off("." + NAMESPACE);
    channelWrappers.on("click." + NAMESPACE, function(){
        channelWrappers.removeAttr("active");
        $(this).closest(".chnl-wrapper").attr("active", "");
        if(channelList.is("[active]")){
            channelListOut.play();
            channelList.removeAttr("active");
        }
    });
    /* END CHANNEL LIST */

    /* BEGIN SEARCH */
    var searchResults = $(".search-results");
    var searchInput = $(".search-input");
    searchInput.off("." + NAMESPACE);
    searchInput.on("keyup." + NAMESPACE, function(event){
        if(event.which == 16 || // Shift
           event.which == 17 || // Ctrl
           event.which == 18){  // Alt
            return;
        }

        clearTimeout(searchTimer);
        searchTimer = setTimeout(searchComplete, SEARCH_TYPING_INTERVAL);

        var query = searchInput.val().trim();
        if(!query.length){ // Query is empty, show channel list.
            searchResults.hide();
            searchResults.removeAttr("active");
            $(".channel-list-inner").fadeIn(100);
        }else if(query.length && !searchResults.is("[active]")){
            $(".channel-list-inner").hide();
            searchResults.fadeIn(100);
            searchResults.attr("active", "");
        }

        if(query.length < 3){ // Search not long enough.
            removeStaleSearches();
            $(".search-results").append("<p class=\"search-no-results\">Search not long enough.</p>");
        }
    });

    searchInput.on("keydown." + NAMESPACE, function(event){
        if(event.which == 16 || // Shift
           event.which == 17 || // Ctrl
           event.which == 18){  // Alt
            return;
        }
        clearTimeout(searchTimer);
    });

    var search = $(".search");
    search.off("." + NAMESPACE);
    search.on("click." + NAMESPACE, function(){
        searchInput.focus();
    });
    /* END SEARCH */

    /* BEGIN DOCUMENT */
    $("html").off("." + NAMESPACE);
    $("html").on("click." + NAMESPACE, handleMessengerDocumentEvent);
    /* END DOCUMENT */
}


/**
 * Handle Messenger Document Event
 * Click event that always fires. Not currently used.
 */
function handleMessengerDocumentEvent(event){
    var target = $(event.target);
}


$(document).on("pjax:success", function(){
    initMessenger(false);
});

$(document).on("ready", function(){
    initMessenger(true);
});


/* BEGIN CHAT */
/**
 * Append Message
 * Adds a new message to the chat body.
 * @param {String} message Body of the message.
 * @param {String} sender Name of sender.
 * @param {String} senderID UUID of the sender.
 * @param {String} timeSent Time that the message was sent.
 */
function appendMessage(message, sender, senderID, timeSent){
    $(".no-messages").remove();
    var mostRecent = $(".messenger-body").children().last();
    var origin = (senderID != window.user_id) ? "left" : "right";
    var time = new Date(timeSent).toLocaleTimeString(navigator.language, {
        hour: "numeric",
        minute: "numeric",
        hour12: false,
    });

    if(mostRecent.attr("data-user-id") == senderID){
        $(".messenger-body").append(
            "<div class='message-wrapper' data-" + origin + " data-sender='" + sender + "' data-user-id='" + senderID + "'>" +
                "<div class='message-content-wrapper'>" +
                    "<p class='message-content' data-new></p>" +
                "</div>" +
            "</div>"
        );
    }else{
        $(".messenger-body").append(
            "<div class='message-wrapper' data-" + origin + " data-image data-sender='" + sender + "' data-user-id='" + senderID + "'>" +
                "<div class='message-image'></div>" +
                "<div class='message-content-wrapper'>" +
                    "<p class='message-content' data-new></p>" +
                "</div>" +
            "</div>"
        );
    }

    // Add the message afterwards via .text() to escape HTML
    messageContent = $(".message-content[data-new]");
    messageContent.text(message);
    messageContent.removeAttr("data-new");

    // Make sure that the body is scrolled to the bottom
    scrollToBottom($(".messenger-body"));

    if(document.hidden){
        Push.create("Message from '" + sender + "'.", {
            body: message,
            timeout: PUSH_TIMEOUT,
        });
    }
}
/* END CHAT */


/* BEGIN SEARCH */
/**
 * Update Search
 * Removes stale search data and adds the latest data from the server.
 * @param {JSON} users A list of users that mach the query
 * @param {Object} friends A dict of friend statuses
 */
function updateSearch(users, friends){
    removeStaleSearches();

    if(users.length == 0){
        // No data returned
        $(".search-results").append("<p class=\"search-no-results\">No results found.</p>");
        return;
    }

    // Iterate over each user
    jQuery.each(users, function(){
        // Defaults
        var innerHTML = "User";
        var className = "user-add";

        if(this.pk in friends){
            switch(friends[this.pk]){
                case "friend":
                    innerHTML = "Friends";
                    className = "user-friend";
                    break;
                case "request_sent":
                    innerHTML = "Request Sent";
                    className = "user-request-sent";
                    break;
                case "request_received":
                    innerHTML = "Accept Request";
                    className = "user-accept-request";
                    break;
            }
        }

        // Add search result
        $(".search-results").append(
            "<div class=\"search-user-wrapper noselect\" href=\"/messages/user/" + this.fields.user_url + "\" data-pjax-m>" +
                "<div class=\"search-user-image\"></div>" +
                "<div class=\"search-user-info\">" +
                    "<p class=\"search-user-name\">" + this.fields.username + " (" + this.pk.substring(0, 8).toUpperCase() + ")</p>" +
                "</div>" +
            "</div>"
        );
    });

    // Add "See all results" button.
    $(".search-results").append(
        "<a class=\"search-all-results noselect\">" +
            "See all results." +
            "<link class=\"rippleJS\">" +
        "</a>"
    );
};


/**
 * Remove Stale Searches
 * Clears the search list of any stale data.
 */
var removeStaleSearches = function(){
    var children = $(".search-results").children();
    children.each(function(){
        $(this).remove();
    });
};


/**
 * Search Complete
 * Function which runs whenever the typing timer runs out. It essentially
 * means the user has finished typing.
 */
function searchComplete(){
    var query = $(".search-input").val().trim();
    if(query != "" && query != null && query.length > 2){
        send("search", query);
        print("Sent a query for users named '" + query + "'");
    }
};
/* END SEARCH */


/* BEGIN INPUT */
/**
 * Handle Messenger Input
 * Handles user input from the messenger.
 * @param {String} input Contents of the input.
 */
function handleMessengerInput(input){
    input = input.trim(); // Remove excessive whitespace
    var re = /^\//; // Matches the literal '/'
    if(re.test(input)){
        parseCommand(input); // Parse command
        return;
    }

    if(input.length){  // Make sure the string isn't empty.
        if(window.channel_url == null){
            print("Attempted to send a message but not currently connected to a channel.", true);
            return;
        }

        data = {
            channel_url: window.channel_url,
            message: input,
        }

        send("message", data);
        appendMessage(input, window.username, window.user_id, Date.now());
        print("Message sent to socket server.");
    }
}


/**
 * Parse Command
 * Parses and handles commands.
 * @param {String} command Command to be parsed.
 */
function parseCommand(command){
    print("Parsing command: '" + command + "'");
}
/* END INPUT */
