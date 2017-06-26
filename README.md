# Outlook Web App Notify

Notify is a bookmarklet for Outlook Web App to display desktop notifications when receiving new email or reminders.

## Install

1. Create a [bookmarklet](https://en.wikipedia.org/wiki/Bookmarklet) of ``<contents of outlook-webapp-notify.js>``
1. Run the bookmarklet every time the page is loaded (your name will turn red when active)

Tested in Chrome.

## Options

Edit ``outlook-webapp-notify.js`` and search the code.

* ``this.checkDelay`` Frequency to check for new events in milliseconds

## Bugs

* Sometimes you'll receive a notification for 0 new events
