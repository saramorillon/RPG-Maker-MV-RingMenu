/*jslint vars: true, nomen: true, plusplus: true, eqeq: true */
/*globals console*/
/*globals Window_Base, Window_MenuCommand, Window_Selectable*/
/*globals Scene_Map, Scene_Menu, SceneManager, Scene_MenuBase*/
/*globals PluginManager, Graphics, Bitmap, ImageManager, AudioManager, Game_Switches, Game_Variables*/
/*globals $gameSwitches, $dataSystem, $gameMap, $gameVariables */
//=============================================================================
// Menu.js
//=============================================================================

/*:
 * @plugindesc Pivert Achievements system.
 * @author Pivert
 *
 * @param -- Achievements --
 *
 * @param Achievements text
 * @desc The text for "Achievements".
 * @default Achievements
 *
 * @param Ach. unlocked text
 * @desc The text for "Achievement unlocked".
 * @default Achievement unlocked!
 *
 * @param Ach. unlocked timer
 * @desc Time for "Achievement unlocked!" window to be displayed (in frames).
 * @default 180
 *
 * @param Ach. unlocked SE
 * @desc Sound effect to be played when "Achievement unlocked!" window is displayed.
 * @default Item1
 *
 * @param Ach. unlocked width
 * @desc Width of "Achievement unlocked!" window.
 * @default 480
 *
 * @param Ach. unlocked X position
 * @desc X position of "Achievement unlocked!" window.
 * @default 0
 *
 * @param Ach. unlocked Y position
 * @desc Y position of "Achievement unlocked!" window.
 * @default 0
 *
 * @param Locked ach. name color
 * @desc Color of the name of locked achievements in achievements window.
 * @default 0
 *
 * @param Unlocked ach. name color
 * @desc Color of the name of unlocked achievements in achievements window.
 * @default 0
 *
 * @param -- Settings --
 *
 * @param Images directory
 * @desc The directory where achievements images are stored
 * @default img/achievements
 *
 * @param Locked image
 * @desc Name of the image which should be used for locked achievements.
 * @default locked
 *
 * @help
 *
 * To create an achievements list, create a file named "Achievements.json" in data directory
 * and give it the following structure :
 *
 * [
 *   {
 *     "id": 1, // id of the switch which will store the achievement
 *     "name": "Achievement", // name of the achievement
 *     "description": "This is an achievement", // description of the achievement
 *     "lockedDescription": "This is a locked achievement", // description displayed when the achievement is still locked (optional)
 *     "img": "achievement_img", // name of the achievement image file without extension
 *  "steps":  10, // steps to unlock the achievement (optional). If set, id will use a variable instead of a switch.
 *  "lockedSteps": "??", // text displayed instead of steps for locked achievements (optional).
 *  "lockedColor": 0, // color number of the name of the achievement when it is locked (optional). If set, override the "Locked ach. name color" option.
 *  "unlockedColor": 0 // color number of the name of the achievement when it is unlocked (optional). If set, override the "Unlocked ach. name color" option.
 *   }
 * ]
 *
 */

(function () {

    "use strict";

    var parameters = PluginManager.parameters('Achievements');

    var lockedImage = String(parameters['Locked image'] || 'locked');
    var imageDirectory = String(parameters['Images directory'] || 'img/achievements');

    var params = {};

    params.achText = String(parameters['Achievements text'] || 'Achievements');
    params.achUnlockedText = String(parameters['Ach. unlocked text'] || 'Achievement unlocked!');
    params.achUnlockedTimer = Number(parameters['Ach. unlocked timer'] || 180);
    params.achUnlockedSe = String(parameters['Ach. unlocked SE'] || 'Item1');
    params.achUnlockedW = Number(parameters['Ach. unlocked width'] || 480);
    params.achUnlockedX = Number(parameters['Ach. unlocked X position'] || 0);
    params.achUnlockedY = Number(parameters['Ach. unlocked Y position'] || 0);
    params.lockedAchColor = Number(parameters['Locked ach. name color'] || 0);
    params.unlockedAchColor = Number(parameters['Unlocked ach. name color'] || 0);

    var startAchievements = function (achievements, lockedBitmap, params) {

        var _Window_AchievementUnlocked = null;

        /*
         * Achievement unlocked window
         */
        function Window_AchievementUnlocked() {
            this.initialize.apply(this, arguments);
        }

        Window_AchievementUnlocked.prototype = Object.create(Window_Base.prototype);
        Window_AchievementUnlocked.prototype.constructor = Window_AchievementUnlocked;

        Window_AchievementUnlocked.prototype.initialize = function () {
            this.timer = params.achUnlockedTimer;
            this.text = params.achText;
            this.achievementsQueue = [];

            var h = this.fittingHeight(2);

            Window_Base.prototype.initialize.call(this, params.achUnlockedX, params.achUnlockedX, params.achUnlockedW, h);
            this.visible = false;
            this.hide();
        };

        Window_AchievementUnlocked.prototype.update = function () {

            this.contents.clear();
            if (this.achievement) {
                this.drawText(params.achUnlockedText, 0, 0);
                this.drawText(this.achievement.name, 0, this.lineHeight() + this.textPadding());
            }

            if (this.isHiding) {
                if (this.width > 0) {
                    this.width -= Graphics.boxWidth / 25;
                } else {
                    this.hidden = true;
                    this.timer = params.achUnlockedTimer;
                }
            } else {
                if (this.width < params.achUnlockedW) {
                    this.width += Graphics.boxWidth / 25;
                } else {
                    this.hidden = false;
                }
            }

            if (this.timer <= 0) {
                this.achievement = undefined;
                this.hide();
            } else {
                this.timer--;
            }
            if (this.hidden && this.achievementsQueue.length) {
                this.refresh();
                this.show();
            }
        };

        Window_AchievementUnlocked.prototype.show = function () {
            this.visible = true;
            this.isHiding = false;
        };

        Window_AchievementUnlocked.prototype.hide = function () {
            this.isHiding = true;
        };

        Window_AchievementUnlocked.prototype.setAchievement = function (achievement) {
            this.achievementsQueue.push(achievement);
            this.refresh();
        };

        Window_AchievementUnlocked.prototype.refresh = function () {
            if (this.achievement) {
                return;
            }

            this.achievement = this.achievementsQueue.pop();

            if (!this.achievement) {
                return;
            }

            AudioManager.playSe({
                name: params.achUnlockedSe,
                volume: 100,
                pitch: 100,
                pan: 0
            });
        };

        /*
         * Achievements Window
         */
        function Window_AchievementsList() {
            this.initialize.apply(this, arguments);
        }

        Window_AchievementsList.prototype = Object.create(Window_Selectable.prototype);
        Window_AchievementsList.prototype.constructor = Window_AchievementsList;

        Window_AchievementsList.lastTopRow = 0;
        Window_AchievementsList.lastIndex = 0;

        Window_AchievementsList.prototype.initialize = function (x, y) {
            var width = Graphics.boxWidth;
            var height = Graphics.boxHeight - y;
            Window_Selectable.prototype.initialize.call(this, x, y, width, height);
            this.refresh();
            this.setTopRow(Window_AchievementsList.lastTopRow);
            this.select(Window_AchievementsList.lastIndex);
            this.activate();
        };

        Window_AchievementsList.prototype.lineHeight = function () {
            return 120;
        };

        Window_AchievementsList.prototype.maxCols = function () {
            return Math.floor(this.contentsWidth() / (this.lineHeight() + this.textPadding()));
        };

        Window_AchievementsList.prototype.maxItems = function () {
            return this._list ? this._list.length : 0;
        };

        Window_AchievementsList.prototype.itemWidth = function () {
            return this.lineHeight();
        };

        Window_AchievementsList.prototype.setDetailsWindow = function (detailsWindow) {
            this._detailsWindow = detailsWindow;
            this.updateDetails();
        };

        Window_AchievementsList.prototype.update = function () {
            Window_Selectable.prototype.update.call(this);
            this.updateDetails();
        };

        Window_AchievementsList.prototype.updateDetails = function () {
            if (this._detailsWindow) {
                var item = this._list[this.index()];
                this._detailsWindow.setItem(item);
            }
        };

        Window_AchievementsList.prototype.refresh = function () {
            var id;
            this._list = [];
            for (id in achievements) {
                if (achievements.hasOwnProperty(id)) {
                    this._list.push(achievements[id]);
                }
            }

            this._list.sort(function (a1, a2) {
                return a1.id > a2.id ? 1 : -1;
            });

            this.createContents();
            this.drawAllItems();
        };

        Window_AchievementsList.prototype.drawItem = function (index) {
            var item = this._list[index];
            var rect = this.itemRect(index);
            this.drawAchievement(item, rect.x + 8, rect.y + 8);
        };

        Window_AchievementsList.prototype.drawAchievement = function (item, x, y) {
            if ($gameSwitches.value(item.id)) {
                this.contents.blt(item.bitmap, 0, 0, item.bitmap.width, item.bitmap.height, x, y);
            } else {
                this.contents.blt(lockedBitmap, 0, 0, item.bitmap.width, item.bitmap.height, x, y);
            }
        };

        Window_AchievementsList.prototype.processCancel = function () {
            Window_Selectable.prototype.processCancel.call(this);
            Window_AchievementsList.lastTopRow = this.topRow();
            Window_AchievementsList.lastIndex = this.index();
        };

        function Window_AchievementsDetails() {
            this.initialize.apply(this, arguments);
        }

        Window_AchievementsDetails.prototype = Object.create(Window_Base.prototype);
        Window_AchievementsDetails.prototype.constructor = Window_AchievementsDetails;

        Window_AchievementsDetails.prototype.initialize = function (x, y) {
            var width = Graphics.boxWidth;
            var height = 150;
            Window_Base.prototype.initialize.call(this, x, y, width, height);
        };

        Window_AchievementsDetails.prototype.setItem = function (item) {
            if (this._item !== item) {
                this._item = item;
                this.refresh();
            }
        };

        Window_AchievementsDetails.prototype.refresh = function () {
            var item = this._item;
            var x = 0;
            var y = 0;
            var lineHeight = this.lineHeight();

            this.contents.clear();

            if (!item) {
                return;
            }

            if ((item.steps && item.steps == $gameVariables.value(item.id)) || $gameSwitches.value(item.id)) {
                this.contents.blt(item.bitmap, 0, 0, item.bitmap.width, item.bitmap.height, 10, 10);
                if (item.unlockedColor) {
                    this.changeTextColor(this.textColor(item.unlockedColor));
                } else {
                    this.changeTextColor(this.textColor(params.unlockedAchColor));
                }
                this.drawText(item.name, 10 + 120 + 10, 0);
                this.resetTextColor();
                this.drawText(item.description, 10 + 120 + 10, lineHeight + this.textPadding());
            } else {
                this.contents.blt(lockedBitmap, 0, 0, item.bitmap.width, item.bitmap.height, 10, 10);
                if (item.lockedColor) {
                    this.changeTextColor(this.textColor(item.lockedColor));
                } else {
                    this.changeTextColor(this.textColor(params.lockedAchColor));
                }
                this.drawText(item.name, 10 + 120 + 10, 0);
                this.resetTextColor();
                this.drawText(item.lockedDescription, 10 + 120 + 10, lineHeight + this.textPadding());
                if (item.steps) {
                    this.drawText($gameVariables.value(item.id) + '/' + (item.lockedSteps || item.steps), 10 + 120 + 10, lineHeight + this.textPadding() + lineHeight + this.textPadding());
                }
            }
        };

        /*
         * Achievements Scene
         */
        function Scene_Achievements() {
            this.initialize.apply(this, arguments);
        }

        Scene_Achievements.prototype = Object.create(Scene_MenuBase.prototype);
        Scene_Achievements.prototype.constructor = Scene_Achievements;

        Scene_Achievements.prototype.initialize = function () {
            Scene_MenuBase.prototype.initialize.call(this);
        };

        Scene_Achievements.prototype.create = function () {
            Scene_MenuBase.prototype.create.call(this);

            this._detailsWindow = new Window_AchievementsDetails(0, 0);

            var y = this._detailsWindow.height;
            this._listWindow = new Window_AchievementsList(0, y);
            this._listWindow.setHandler('cancel', this.popScene.bind(this));

            this.addWindow(this._listWindow);
            this.addWindow(this._detailsWindow);

            this._listWindow.setDetailsWindow(this._detailsWindow);
        };

        var achievements_map_createDisplayObjects = Scene_Map.prototype.createDisplayObjects;
        Scene_Map.prototype.createDisplayObjects = function () {
            achievements_map_createDisplayObjects.call(this);
            this.createWindowPop();
        };

        Scene_Map.prototype.createWindowPop = function () {
            _Window_AchievementUnlocked = new Window_AchievementUnlocked();
            this.addChild(_Window_AchievementUnlocked);
        };

        Window_MenuCommand.prototype.addOriginalCommands = function () {
            this.addCommand(params.achText, 'achievements', true);
        };

        var achievements_menu_createCommandWindow = Scene_Menu.prototype.createCommandWindow;
        Scene_Menu.prototype.createCommandWindow = function () {
            achievements_menu_createCommandWindow.call(this);
            this._commandWindow.setHandler('achievements', this.commandLoad.bind(this));
            this.addWindow(this._commandWindow);
        };

        Scene_Menu.prototype.commandLoad = function () {
            SceneManager.push(Scene_Achievements);
        };

        Game_Switches.prototype.setValue = function (switchId, value) {
            if (switchId > 0 && switchId < $dataSystem.switches.length) {
                this._data[switchId] = value;
                this.onChange(switchId);
            }
        };

        Game_Switches.prototype.onChange = function (switchId) {
            $gameMap.requestRefresh();

            if ($gameSwitches.value(switchId) && achievements[switchId] && !achievements.steps) {
                _Window_AchievementUnlocked.setAchievement(achievements[switchId]);
                _Window_AchievementUnlocked.show();
            }
        };

        Game_Variables.prototype.setValue = function (variableId, value) {
            if (variableId > 0 && variableId < $dataSystem.variables.length) {
                if (typeof value === 'number') {
                    value = Math.floor(value);
                }
                this._data[variableId] = value;
                this.onChange(variableId);
            }
        };

        Game_Variables.prototype.onChange = function (variableId) {
            $gameMap.requestRefresh();

            if (achievements[variableId] && $gameVariables.value(variableId) == achievements[variableId].steps) {
                _Window_AchievementUnlocked.setAchievement(achievements[variableId]);
                _Window_AchievementUnlocked.show();
            }
        };
    };

    var loadAchievements = function () {

        var xhr = new XMLHttpRequest();
        xhr.overrideMimeType('application/json');
        xhr.open('GET', 'data/Achievements.json');

        xhr.onload = function () {
            if (xhr.status < 400) {
                try {
                    var achievements = {};
                    var achievementsArray = JSON.parse(xhr.responseText);

                    var i;
                    for (i = 0; i < achievementsArray.length; i++) {
                        var achievement = achievementsArray[i];
                        var bitmap = ImageManager.loadBitmap(imageDirectory + '/', achievement.img);
                        achievements[achievement.id] = achievement;
                        achievements[achievement.id].bitmap = bitmap;
                        achievements[achievement.id].lockedDescription = achievements[achievement.id].lockedDescription || achievements[achievement.id].description;
                    }

                    var locked = ImageManager.loadBitmap(imageDirectory + '/', lockedImage);

                    startAchievements(achievements, locked, params);
                } catch (e) {
                    console.error('Could not load script');
                    console.error(e);
                }
            } else {
                console.error('File data/Achievements.json not found');
            }
        };

        xhr.onerror = function (e) {
            console.error('Error while fetching data/Achievements.json');
            console.error(e);
        };

        xhr.send();
    };

    loadAchievements();

}());
