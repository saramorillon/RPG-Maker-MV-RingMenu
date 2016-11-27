/*jslint vars: true, nomen: true, plusplus: true, eqeq: true */
/*globals console */
/*globals TouchInput */
//=============================================================================
// TouchInputUpdate.js
//=============================================================================

/*:
 * @plugindesc Pivert Touch Input Update.
 * @author Pivert
 *
 */
(function () {

    'use strict';

    //=============================================================================
    // Touch input
    //=============================================================================
    var TouchInput_onMouseMove = TouchInput._onMouseMove;
    TouchInput._onMouseMove = function (event) {
        TouchInput_onMouseMove.call(this, event);

        this._cursorX = Graphics.pageToCanvasX(event.pageX);
        this._cursorY = Graphics.pageToCanvasY(event.pageY);
    };

}());