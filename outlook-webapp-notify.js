javascript:
(function() {
  var InboxNotify = function() {
    this.checkDelay = 10 * 1000; //Check for new events every X milliseconds

    this.lastUnread = null;
    this.lastReminders = null;

    this.lastPopup = null;
    this.timerId = null;

    this.isChecking = false;

    this.notifyImage = this.findNotifyImage();
    this.showUnreadFirst();

    if (Notification.permission != 'granted') {
      Notification.requestPermission(function(context) {
            return function() {
                if (Notification.permission == 'granted') {
                  context.start();
                }
              };
        }(this));
    } else {
      this.start();
    }
  };

  InboxNotify.prototype.showUnreadFirst = function() {
    $('div[role=menu] span[role=menuitemradio]').each(function(index) {
        if ($(this).text() == 'unread') {
          $(this).click();
        }
      });
  };

  InboxNotify.prototype.findNotifyImage = function() {
    var bg = $('.image-headerbgmain-png').css('backgroundImage');

    if (bg) {
      bg = bg.replace(/.*\s?url\([\'\"]?/, '').replace(/[\'\"]?\).*/, '');
    }

    return bg;
  };

  InboxNotify.prototype.nameColour = function(set) {
    var elem = $('div._hl_A div._hl_d > span');
    if (set) {
      elem.css('color', set);
    } else {
      return elem.css('color');
    }
  };

  InboxNotify.prototype.getUnread = function() {
    var inboxId = $('#MailFolderPane\\.FavoritesFolders span[title="Inbox"][role="heading"]').attr('id');
    var attrId = inboxId.split('.')[0];
    var inboxUnread = $('#' + attrId + '\\.ucount').html();
    var inboxUnreadCount = inboxUnread ? parseInt(inboxUnread.split(' ')[0], 10) : 0;

    if (isNaN(inboxUnreadCount)) {
      return null;
    }

    return inboxUnreadCount;
  };

  InboxNotify.prototype.hasReminders = function() {
    var remindersDisplay = $('._f_n4[ispopup="1"]').css('display');

    if (!remindersDisplay) {
      return null;
    }

    return (remindersDisplay == 'block');
  };

  InboxNotify.prototype.checkUnread = function() {
    if (this.isChecking) {
      return;
    }

    this.isChecking = true;

    var popup;
    var unreadCount;
    var remindersVisible;
    var str;

    try {
      unreadCount = this.getUnread();
      remindersVisible = this.hasReminders();

      if (unreadCount === null || remindersVisible === null) {
        this.stop();
        throw new Error('Error getting unread count/reminders');
      }

      unreadChanged = (unreadCount > this.lastUnread);
      remindersChanged = (remindersVisible != this.lastReminders);

      if ((unreadCount != this.lastUnread || remindersChanged) && this.lastPopup !== null) {
        this.lastPopup.close();
      }

      if (unreadChanged || remindersChanged) {
        str = unreadCount + ' unread messages';
        if (remindersChanged) {
          str += ' and reminders';
        }

        popup = new Notification('Inbox', { body: str, icon: this.notifyImage || null });
        popup.onclick = function(context) {
            return function() {
                this.close();
                context.lastPopup = null;
              };
          }(this);

        this.lastPopup = popup;
      }

      this.lastUnread = unreadCount;
      this.lastReminders = remindersVisible;

    } finally {
      this.isChecking = false;
    }
  };

  InboxNotify.prototype.start = function() {
    if (this.timerId !== null) {
      return;
    }

    this.lastNameColour = this.nameColour();
    this.lastUnread = this.getUnread();
    this.lastReminders = this.hasReminders();
    this.isChecking = false;
    this.nameColour('#ff0000');

    this.timerId = window.setInterval(function(context) {
        return function() {
            context.checkUnread();
          };
      }(this), this.checkDelay);
  };

  InboxNotify.prototype.stop = function() {
    if (this.timerId !== null) {
      window.clearInterval(this.timerId);
      this.timerId = null;
    }

    if (this.lastPopup !== null) {
      this.lastPopup.close();
    }

    if (this.lastNameColour) {
      this.nameColour(this.lastNameColour);
    }
  };

  if (window.InboxNotify && window.InboxNotify.stop) {
    window.InboxNotify.stop();
  }

  window.InboxNotify = new InboxNotify();

})();
