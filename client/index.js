/**
 *
 * @author Yuxin Chen <chenyuxin.mail@gmail.com>
 * @created 12/27/15
 *
 */

'use strict';

var app = angular.module('direwolves', []);

app.controller('mainCtrl', function($scope, Doc) {
    $scope.doc = Doc;

    $scope.state = 1;

    $scope.join = function() {
        $scope.state = 0;
        ipc.send('connect', {
            host: $scope.host,
            port: $scope.port
        });
        Doc.join($scope.docid);
    };
});

app.directive('ace', function($timeout, $interval) {
    return {
        restrict: 'A',
        require: '?ngModel',
        scope: {},
        link: function(scope, elem, attrs, ngModel) {
            var node = elem[0];
            var editor = ace.edit(node);

            editor.setTheme("ace/theme/tomorrow_night_eighties");
            editor.getSession().setMode('ace/mode/markdown');

            editor.session.setUseWrapMode(true);
            function onResize() {
                var session = editor.session;

                editor.resize();
                if(session.getUseWrapMode()) {
                    var characterWidth = editor.renderer.characterWidth;
                    var contentWidth = editor.renderer.scroller.clientWidth;

                    if(contentWidth > 0) {
                        // scrollbar width, FIXME!
                        session.setWrapLimit(parseInt(contentWidth / characterWidth, 10) - 3);
                    }
                }
            }
            window.onresize = onResize;
            onResize();

            ngModel.$render = function() {
                var chgset = Changeset.fromDiff(engine.diff_main(editor.getValue(), ngModel.$viewValue));

                var doc = editor.session.getDocument();
                var idx = doc.positionToIndex(editor.getCursorPosition());
                var oldScrollTop = editor.session.getScrollTop();
                var oldCursorPos = editor.getCursorPosition();

                editor.setValue(ngModel.$viewValue, 1);

                // calculate new cursor index
                // '=' and '-' means old text
                // '=' and '+' means new text
                // if the text old cursor pointed to is removed,
                // new cursor should be at the begin of removed text
                var pos = 0;
                for(var i = 0; i < chgset.length; i++) {
                    if(chgset[i].symbol === '=' || chgset[i].symbol === '-') {
                        if(chgset[i].length >= idx) break;
                        idx -= chgset[i].length;
                    }
                    if(chgset[i].symbol === '=' || chgset[i].symbol === '+') {
                        pos += chgset[i].length;
                    }
                }

                if(i < chgset.length) {
                    if(chgset[i].symbol == '-'){
                        editor.moveCursorToPosition(doc.indexToPosition(pos));
                    } else {
                        editor.moveCursorToPosition(doc.indexToPosition(pos + idx));
                    }
                } else {
                    editor.moveCursorToPosition(doc.indexToPosition(Number.MAX_SAFE_INTEGER));
                }

                editor.session.setScrollTop(editor.getCursorPosition().row - oldCursorPos.row + oldScrollTop);
            };

            editor.on('change', function () {
                $timeout(function() {
                    scope.$apply(function() {
                        var value = editor.getValue();
                        ngModel.$setViewValue(value);
                    })
                });
            })
        }
    }
});

var marked = require('marked');
var highlight = require('highlight.js');

marked.setOptions({
    renderer: new marked.Renderer(),
    //math: {
    //    render: function (tex) {
    //        console.warn('ddd', tex);
    //        return tex;
    //        return '<script type="math/text; mode=display">' + tex + '</script>';
    //    }
    //},
    math: null,
    gfm: true,
    tables: true,
    breaks: false,
    pedantic: false,
    sanitize: true,
    smartLists: true,
    smartypants: false
});

marked.setOptions({
    highlight: function(code) {
        return highlight.highlightAuto(code).value;
    }
});

app.directive('md', function($timeout) {
    return {
        restrict: 'A',
        require: '?ngModel',
        scope: {},
        link: function(scope, elem, attrs, ngModel) {
            var node = elem[0];

            ngModel.$render = function() {
                node.innerHTML = marked(ngModel.$viewValue);
            };
        }
    }
});
