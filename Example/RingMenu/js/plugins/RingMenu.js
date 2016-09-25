/*jslint vars: true, nomen: true, plusplus: true, eqeq: true */
/*globals console*/
/*globals Window_Base, Window_MenuStatus, Window_MenuCommand, Window_Selectable, Window_Gold, Window_Status*/
/*globals Scene_Menu, SceneManager, Scene_MenuBase, Scene_Skill, Scene_Equip, Scene_Status*/
/*globals PluginManager, Graphics, Bitmap, ImageManager, TouchInput, TextManager*/
/*globals $gamePlayer, $gameParty */
//=============================================================================
// RingMenu.js
//=============================================================================

/*:
 * @plugindesc Pivert ring menu
 * @author Pivert
 *
 * @param Images directory
 * @desc The directory where ring menu images are stored
 * @default img/ringMenu
 *
 * @param Hover image
 * @desc Name of the image which should be used for ring menu hover.
 * @default hover
 *
 * @param Use Keyboard
 * @desc Usable with the keyboard or only with mouse.
 * @default false
 *
 * @param Ring radius
 * @desc Radius of the ring menu.
 * @default 148
 *
 * @help This plugin does not provide plugin commands.
 */

(function () {
    "use strict";

    var parameters = PluginManager.parameters('RingMenu');

    var imageDirectory = String(parameters['Images directory'] || 'img/ringMenu');
    var hoverImage = String(parameters['Hover image'] || 'hover');
    var useKeyboard = parameters['Use Keyboard'] === 'true';
    var RADIUS = Number(parameters['Ring radius'] || 148);

    //=============================================================================
    // Ring menu window
    //=============================================================================
    function Window_RingMenu() {
        this.initialize.apply(this, arguments);
    }

    Window_RingMenu.prototype = Object.create(Window_Base.prototype);
    Window_RingMenu.prototype.constructor = Window_RingMenu;

    Window_RingMenu.prototype.initialize = function (commandWindow) {
        this._commands = commandWindow._list;

        var x = Graphics.boxWidth / 2 - RADIUS;
        var y = Graphics.boxHeight / 2 - RADIUS;
        var width = RADIUS * 2;
        var height = RADIUS * 2;

        Window_Base.prototype.initialize.call(this, x, y, width, height);

        this.windowskin = new Bitmap();
        this._radius = 0;
    };

    Window_RingMenu.prototype.setCommandWindow = function (commandWindow) {
        this._commandWindow = commandWindow;
    };

    Window_RingMenu.prototype.setItem = function (item) {
        if (this.item !== item) {
            this._item = item;
        }
    };

    Window_RingMenu.prototype.update = function () {
        this.contents.clear();

        var tX = TouchInput._cursorX - this.x - this.padding;
        var tY = TouchInput._cursorY - this.y - this.padding;

        this.x = $gamePlayer.screenX() - this.width / 2;
        this.y = $gamePlayer.screenY() - this.height / 2 - 24;

        this.x = this.x < 150 ? 150 : this.x > Graphics.boxWidth - this.width ? Graphics.boxWidth - this.width : this.x;
        this.y = this.y < 0 ? 0 : this.y > Graphics.boxHeight - this.height - 72 ? Graphics.boxHeight - this.height - 72 : this.y;

        var x0 = this.width / 2 - this.padding;
        var y0 = this.height / 2 - this.padding;

        var theta = 2 * Math.PI / this._commands.length;

        var commands = this._commands;

        this._onHover = false;

        if (this._radius < RADIUS - 48) {
            this._radius += 10;
        }

        var xI;
        var yI;

        var bitmap;

        var x1;
        var y1;
        var x2;
        var y2;

        var i;
        for (i = 0; i < commands.length; i++) {
            bitmap = commands[i].bitmap;

            xI = Math.round(x0 + this._radius * Math.cos(theta * i - Math.PI / 2));
            yI = Math.round(y0 + this._radius * Math.sin(theta * i - Math.PI / 2));

            if (useKeyboard) {
                xI = Math.round(x0 + this._radius * Math.cos(theta * (i - this._commandWindow.index()) - Math.PI / 2));
                yI = Math.round(y0 + this._radius * Math.sin(theta * (i - this._commandWindow.index()) - Math.PI / 2));
            }

            x1 = xI - bitmap.width / 2;
            y1 = yI - bitmap.height / 2;

            x2 = xI + bitmap.width / 2;
            y2 = yI + bitmap.height / 2;

            if (tX >= Math.min(x1, x2) && tX <= Math.max(x1, x2) && tY >= Math.min(y1, y2) && tY <= Math.max(y1, y2)) {
                if (TouchInput.isTriggered()) {
                    this._commandWindow.select(this._commandWindow._list.indexOf(commands[i]));
                    this._commandWindow.processOk();
                }
                this.drawText(commands[i].name, -this.padding, y0 - this.lineHeight() / 2, this.width, 'center');
                this.contents.blt(this._hoverBitmap, 0, 0, this._hoverBitmap.width, this._hoverBitmap.height, xI - this._hoverBitmap.width / 2, yI - this._hoverBitmap.height / 2);
                this._onHover = true;
            }
        }

        for (i = 0; i < commands.length; i++) {
            bitmap = commands[i].bitmap;

            xI = Math.round(x0 + this._radius * Math.cos(theta * i - Math.PI / 2));
            yI = Math.round(y0 + this._radius * Math.sin(theta * i - Math.PI / 2));

            if (useKeyboard) {
                xI = Math.round(x0 + this._radius * Math.cos(theta * (i - this._commandWindow.index()) - Math.PI / 2));
                yI = Math.round(y0 + this._radius * Math.sin(theta * (i - this._commandWindow.index()) - Math.PI / 2));
            }

            x1 = xI - bitmap.width / 2;
            y1 = yI - bitmap.height / 2;

            if (useKeyboard && !this._onHover && this._commandWindow.index() == i) {
                this.contents.blt(this._hoverBitmap, 0, 0, this._hoverBitmap.width, this._hoverBitmap.height, xI - this._hoverBitmap.width / 2, yI - this._hoverBitmap.height / 2);
            }

            this.contents.blt(bitmap, 0, 0, bitmap.width, bitmap.height, x1, y1);
        }

        if (useKeyboard && !this._onHover && this._radius == RADIUS - 48) {
            this.drawText(this._item.name, -this.padding, y0 - this.lineHeight() / 2, this.width, 'center');
        }
    };

    //=============================================================================
    // Scene menu
    //=============================================================================
    var Scene_Menu_create = Scene_Menu.prototype.create;
    Scene_Menu.prototype.create = function () {
        Scene_Menu_create.call(this);

        this._goldWindow.x = Graphics.boxWidth - this._goldWindow.width;

        this._statusWindow.x = 0;
        this._statusWindow.width = 150;
        this._statusWindow.height = Graphics.boxHeight;

        this._commandWindow.height = this._commandWindow.fittingHeight(1);
        this._commandWindow.width = 0;

        this._ringMenuWindow = new Window_RingMenu(this._commandWindow);
        this._ringMenuWindow.setCommandWindow(this._commandWindow);
        this._commandWindow.setRingMenu(this._ringMenuWindow);

        this.addWindow(this._ringMenuWindow);
        this.addWindow(this._statusWindow);
        this.addWindow(this._goldWindow);

        var i;
        for (i = 0; i < this._commandWindow._list.length; i++) {
            var command = this._commandWindow._list[i];
            command.bitmap = ImageManager.loadBitmap(imageDirectory + '/', this._commandWindow._list[i].symbol);
            command.index = i;
        }

        this._ringMenuWindow._hoverBitmap = ImageManager.loadBitmap(imageDirectory + '/', hoverImage);
    };

    Scene_Menu.prototype.createGoldWindow = function () {
        this._goldWindow = new Window_Gold(0, 0);
        this._goldWindow.y = Graphics.boxHeight - this._goldWindow.height;
    };

    Scene_Menu.prototype.createStatusWindow = function () {
        this._statusWindow = new Window_MenuStatus(this._commandWindow.width, 0);
    };

    //=============================================================================
    // Window menu command
    //=============================================================================
    Window_MenuCommand.prototype.maxCols = function () {
        return this._list ? this._list.length : 10;
    };

    Window_MenuCommand.prototype.setRingMenu = function (ringMenu) {
        this._ringMenu = ringMenu;
    };

    var RingMenu_MenuCommand_update = Window_MenuCommand.prototype.update;
    Window_MenuCommand.prototype.update = function () {
        RingMenu_MenuCommand_update.call(this);
        this.updateRingMenu();
    };

    Window_MenuCommand.prototype.updateRingMenu = function () {
        if (this._ringMenu) {
            var item = this._list[this.index()];
            this._ringMenu.setItem(item);
        }
    };

    //=============================================================================
    // Window menu status
    //=============================================================================
    Window_MenuStatus.prototype.lineHeight = function () {
        return 102;
    };

    Window_MenuStatus.prototype.itemWidth = function () {
        return 102;
    };

    Window_MenuStatus.prototype.itemHeight = function () {
        return 102;
    };

    Window_MenuStatus.prototype.drawItemImage = function (index) {
        var actor = $gameParty.members()[index];
        var rect = this.itemRect(index);
        this.changePaintOpacity(actor.isBattleMember());
        this.drawActorFace(actor, rect.x + 4, rect.y + 4, rect.width - 8, rect.height - 8);
    };

    Window_MenuStatus.prototype.drawActorFace = function (actor, x, y, w, h) {
        var width = Window_Base._faceWidth;
        var height = Window_Base._faceHeight;
        var bitmap = ImageManager.loadFace(actor.faceName());
        var pw = Window_Base._faceWidth;
        var ph = Window_Base._faceHeight;
        var sw = Math.min(width, pw);
        var sh = Math.min(height, ph);
        var dx = Math.floor(x + Math.max(width - pw, 0) / 2);
        var dy = Math.floor(y + Math.max(height - ph, 0) / 2);
        var sx = actor.faceIndex() % 4 * pw + (pw - sw) / 2;
        var sy = Math.floor(actor.faceIndex() / 4) * ph + (ph - sh) / 2;
        this.contents.blt(bitmap, sx, sy, sw, sh, dx, dy, w, h);
    };

    Window_MenuStatus.prototype.drawItemStatus = function (index) {};

    //=============================================================================
    // Window_Gold
    //=============================================================================
    Window_Gold.prototype.windowWidth = function () {
        return 140;
    };

    //=============================================================================
    // Touch input
    //=============================================================================
    TouchInput._onMouseMove = function (event) {
        var x = Graphics.pageToCanvasX(event.pageX);
        var y = Graphics.pageToCanvasY(event.pageY);

        if (this._mousePressed) {
            this._onMove(x, y);
        }

        this._cursorX = x;
        this._cursorY = y;
    };

}());
