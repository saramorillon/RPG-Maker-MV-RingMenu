/*jslint vars: true, nomen: true, plusplus: true, eqeq: true */
/*globals console*/
/*globals Window_Base, Window_MenuStatus, Window_MenuCommand*/
/*globals Scene_Menu, SceneManager, Scene_MenuBase, Scene_Skill, Scene_Equip, Scene_Status*/
/*globals PluginManager, Graphics, Bitmap, ImageManager, TouchInput*/
/*globals $gamePlayer */
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
 * @help This plugin does not provide plugin commands.
 */

(function () {
    "use strict";

    var parameters = PluginManager.parameters('RingMenu');

    var imageDirectory = String(parameters['Images directory'] || 'img/ringMenu');
    var hoverImage = String(parameters['Hover image'] || 'hover');

    var bitmaps = {};
    var hover;

    function Window_RingMenu() {
        this.initialize.apply(this, arguments);
    }

    Window_RingMenu.prototype = Object.create(Window_Base.prototype);
    Window_RingMenu.prototype.constructor = Window_RingMenu;

    Window_RingMenu.prototype.initialize = function (commandWindow) {
        this._commands = commandWindow._list;
        var r = 148;
        var x = Graphics.boxWidth / 2 - r;
        var y = Graphics.boxHeight / 2 - r;
        var width = r * 2;
        var height = r * 2;

        Window_Base.prototype.initialize.call(this, x, y, width, height);

        this.windowskin = new Bitmap();
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

        this.x = this.x < 0 ? 0 : this.x > Graphics.boxWidth - this.width ? Graphics.boxWidth - this.width : this.x;
        this.y = this.y < 0 ? 0 : this.y > Graphics.boxHeight - this.height ? Graphics.boxHeight - this.height : this.y;

        var x0 = this.width / 2 - this.padding;
        var y0 = this.height / 2 - this.padding;

        var r = 100;
        var theta = 2 * Math.PI / this._commands.length;

        var index = this._commands.indexOf(this._item);

        var part1 = this._commands.slice(0, index);
        var part2 = this._commands.slice(index);
        var commands = part2.concat(part1);

        var i;
        for (i = 0; i < commands.length; i++) {
            var bitmap = bitmaps[commands[i].symbol];

            var xI = Math.round(x0 + r * Math.cos(theta * i + Math.PI / 2));
            var yI = Math.round(y0 + r * Math.sin(theta * i + Math.PI / 2));

            var x1 = xI - bitmap.width / 2;
            var y1 = yI - bitmap.height / 2;

            var x2 = xI + bitmap.width / 2;
            var y2 = yI + bitmap.height / 2;
            if (tX >= Math.min(x1, x2) && tX <= Math.max(x1, x2) && tY >= Math.min(y1, y2) && tY <= Math.max(y1, y2)) {
                if (TouchInput.isTriggered()) {
                    this._commandWindow.select(this._commandWindow._list.indexOf(commands[i]));
                    this._commandWindow.processOk();
                }
                this.contents.blt(hover, 0, 0, hover.width, hover.height, xI - hover.width / 2, yI - hover.height / 2);
            }
            this.contents.blt(bitmap, 0, 0, bitmap.width, bitmap.height, x1, y1);
        }
    };

    function Scene_MenuStatus() {
        this.initialize.apply(this, arguments);
    }

    Scene_MenuStatus.prototype = Object.create(Scene_MenuBase.prototype);
    Scene_MenuStatus.prototype.constructor = Scene_MenuStatus;

    Scene_MenuStatus.prototype.initialize = function () {
        Scene_MenuBase.prototype.initialize.call(this);
    };

    Scene_MenuStatus.prototype.create = function () {
        Scene_MenuBase.prototype.create.call(this);

        this._statusWindow = new Window_MenuStatus(0, 0);
        this._statusWindow.setFormationMode(false);
        this._statusWindow.selectLast();
        this._statusWindow.activate();
        this._statusWindow.setHandler('skill', this.commandSkill.bind(this));
        this._statusWindow.setHandler('equip', this.commandEquip.bind(this));
        this._statusWindow.setHandler('status', this.commandStatus.bind(this));
        this._statusWindow.setHandler('cancel', this.popScene.bind(this));
        this._statusWindow.width = Graphics.boxWidth;
        this.addWindow(this._statusWindow);
    };
    
    Scene_MenuStatus.prototype.commandSkill = function () {
        SceneManager.push(Scene_Skill);
    };
    
    Scene_MenuStatus.prototype.commandEquip = function () {
        SceneManager.push(Scene_Equip);
    };
    
    Scene_MenuStatus.prototype.commandStatus = function () {
        SceneManager.push(Scene_Status);
    };

    var RingMenu_Menu_create = Scene_Menu.prototype.create;
    Scene_Menu.prototype.create = function () {
        RingMenu_Menu_create.call(this);
        this._commandWindow.height = this._commandWindow.fittingHeight(1);
        this._commandWindow.width = Graphics.boxWidth;
        this._goldWindow.x = Graphics.boxWidth - this._goldWindow.width;

        this._ringMenuWindow = new Window_RingMenu(this._commandWindow);
        this._ringMenuWindow.setCommandWindow(this._commandWindow);
        this._commandWindow.setRingMenu(this._ringMenuWindow);
        this.addWindow(this._ringMenuWindow);

        var i;
        for (i = 0; i < this._commandWindow._list.length; i++) {
            var bitmap = ImageManager.loadBitmap(imageDirectory + '/', this._commandWindow._list[i].symbol);
            bitmaps[this._commandWindow._list[i].symbol] = bitmap;
        }
        hover = ImageManager.loadBitmap(imageDirectory + '/', hoverImage);
    };

    Scene_Menu.prototype.start = function () {
        Scene_MenuBase.prototype.start.call(this);
    };

    Scene_Menu.prototype.createStatusWindow = function () {};

    Scene_Menu.prototype.commandPersonal = function () {
        SceneManager.push(Scene_MenuStatus);
    };

    Window_MenuCommand.prototype.windowWidth = function () {
        return Graphics.boxWidth;
    };

    Window_MenuCommand.prototype.maxCols = function () {
        return this._list ? this._list.length : 10;
    };

    Window_MenuCommand.prototype.fittingHeight = function (numLines) {
        return 1;
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

    Window_MenuStatus.prototype.maxCols = function () {
        return 1;
    };

    var RingMenu_TouchInput_onMouseMove = TouchInput._onMouseMove;
    TouchInput._onMouseMove = function (event) {
        RingMenu_TouchInput_onMouseMove.call(this, event);
        this._cursorX = event.pageX;
        this._cursorY = event.pageY;
    };

}());
