/*jslint vars: true, nomen: true, plusplus: true, eqeq: true */
/*globals console, Window_MenuCommand, Graphics, Scene_Menu, Window_Selectable, Bitmap, ImageManager,  Window_MenuStatus, SceneManager, Scene_Skill, Scene_Equip, Scene_Status, Scene_MenuBase */
//=============================================================================
// RingMenu.js
//=============================================================================

/*:
 * @plugindesc Ring menu
 * @author Pivert
 *
 * @help This plugin does not provide plugin commands.
 */

(function () {
    "use strict";

    var bitmaps = {};
    var currentSymbol;

    var RingMenu_MenuCommand_initialize = Window_MenuCommand.prototype.initialize;
    Window_MenuCommand.prototype.initialize = function (commandWindow) {

        var r = 148;
        var x = Graphics.boxWidth / 2 - r;
        var y = Graphics.boxHeight / 2 - r;

        RingMenu_MenuCommand_initialize.call(this, x, y);

        //        this.windowskin = new Bitmap();
    };

    Window_MenuCommand.prototype.itemWidth = function () {
        return 32;
    };

    Window_MenuCommand.prototype.itemHeight = function () {
        return 32;
    };

    Window_MenuCommand.prototype.windowWidth = function () {
        return 148 * 2;
    };

    Window_MenuCommand.prototype.windowHeight = function () {
        return 148 * 2;
    };

    Window_MenuCommand.prototype.drawAllItems = function () {

        var x0 = this.width / 2 - this.padding;
        var y0 = this.height / 2 - this.padding;

        var r = 100;
        var theta = 2 * Math.PI / this._list.length;

        var index = this.index();

        var part1 = this._list.slice(0, index);
        var part2 = this._list.slice(index);
        var commands;
        if (index == -1) {
            commands = part2.concat(part1);
        } else {
            commands = this._list;
        }

        /* currentSymbol = commands[0].symbol;

         var bitmap = bitmaps[currentSymbol];
         this.contents.blt(bitmap, 0, 0, bitmap.width, bitmap.height, x0 - bitmap.width / 2, y0 - bitmap.height / 2);*/

        var me = this;

        var bitmapLoaded = function () {
            console.log(this);

//            var xI = Math.round(x0 + r * Math.cos(theta * i + Math.PI / 2)) - this.width / 2;
//            var yI = Math.round(y0 + r * Math.sin(theta * i + Math.PI / 2)) - this.height / 2; // + Math.PI / 2;
//
//            me.contents.blt(bitmap, 0, 0, this.width, this.height, xI, yI);
        };

        var i;
        for (i = 0; i < commands.length; i++) {
            var bitmap = ImageManager.loadBitmap('img/ringMenu/', commands[i].symbol);
            bitmap.addLoadListener(bitmapLoaded);
        }
    };

    Window_MenuCommand.prototype.cursorDown = function (wrap) {};

    Window_MenuCommand.prototype.cursorUp = function (wrap) {};

    Window_MenuCommand.prototype.cursorRight = function (wrap) {
        this.select(this.index() + 1 > this._list.length - 1 ? 0 : this.index() + 1);
    };

    Window_MenuCommand.prototype.cursorLeft = function (wrap) {
        this.select(this.index() - 1 < 0 ? this._list.length - 1 : this.index() - 1);
    };

    Window_MenuCommand.prototype.cursorPagedown = function () {};

    Window_MenuCommand.prototype.cursorPageup = function () {};

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
        this._statusWindow.setHandler('ok', this.onPersonalOk.bind(this));
        this._statusWindow.setHandler('cancel', this.popScene.bind(this));
        this._statusWindow.width = Graphics.boxWidth;
        this.addWindow(this._statusWindow);
    };

    Scene_MenuStatus.prototype.onPersonalOk = function () {
        if (currentSymbol === 'skill') {
            SceneManager.push(Scene_Skill);
        } else if (currentSymbol === 'equip') {
            SceneManager.push(Scene_Equip);
        } else if (currentSymbol === 'status') {
            SceneManager.push(Scene_Status);
        }
    };

    var RingMenu_Menu_create = Scene_Menu.prototype.create;
    Scene_Menu.prototype.create = function () {
        RingMenu_Menu_create.call(this);

        this._goldWindow.x = Graphics.boxWidth - this._goldWindow.width;
    };

    Scene_Menu.prototype.start = function () {
        Scene_MenuBase.prototype.start.call(this);
    };

    Scene_Menu.prototype.createStatusWindow = function () {};

    Scene_Menu.prototype.commandPersonal = function () {
        SceneManager.push(Scene_MenuStatus);
    };

}());
