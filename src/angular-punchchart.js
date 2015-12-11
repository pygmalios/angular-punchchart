(function () {
'use strict';

var module = angular.module('pygmalios.punchchart', []);

module.directive('punchChart', function($window) {

    var getMaxValue = function(data) {
        var max = 1;
        data.forEach(function(xValues){
            xValues.forEach(function(value){
                if (max < value) {
                    max = value;
                }
            });
        });

        return max;
    };

    return {

        restrict: 'EA',
        scope: {
            chartData: '=',
            xlabels: '=',
            ylabels: '=',
            options: '='
        },
        template: '<svg width="100%" height="100%" viewBox="0 0 800 300" preserveAspectRatio="xMaxYMax"></svg>',
        link: function(scope, elem, attrs){

            var VIEWPORT_WIDTH = 800;
            var VIEWPORT_HEIGHT = 300;

            var PADDING_TOP = 10;
            var LABEL_LEFT = 30;
            var LABEL_BOTTOM = 30;
            var LINE_SIZE_X = 30;
            var LINE_SIZE_Y = 30;
            var MAX_RADIUS = 12;

            var PUNCT_COLOR;
            var LABEL_COLOR;
            var LINE_COLOR;
            var FONT_SIZE;
            var FONT_WEIGHT;

            var d3 = $window.d3;
            var rawSvg = elem.find('svg');
            var svg = d3.select(rawSvg[0]);

            var maxValue;
            var valueScaleFactor;

            var yAxisLength;
            var xAxisLength;

            var tip = d3.tip()
                .attr('class', 'd3-tip')
                .offset([-10, 0]);

            svg.call(tip);

            var init = function() {
                maxValue = getMaxValue(scope.chartData);

                yAxisLength = scope.chartData.length;
                xAxisLength = scope.chartData[0] ? scope.chartData[0].length : 1;

                LINE_SIZE_Y = (VIEWPORT_HEIGHT - PADDING_TOP - LABEL_BOTTOM) / (scope.ylabels.length + 1);
                LINE_SIZE_X = (VIEWPORT_WIDTH - LABEL_BOTTOM) / (scope.xlabels.length + 1);
                MAX_RADIUS = LINE_SIZE_X < LINE_SIZE_Y ? Math.floor(LINE_SIZE_X * 9 / 20) : Math.floor(LINE_SIZE_Y * 9 / 20);
                valueScaleFactor = maxValue / MAX_RADIUS;

                scope.options = scope.options || {};
                PUNCT_COLOR = scope.options.PUNCT_COLOR || '#62BFCE';
                LABEL_COLOR = scope.options.LABEL_COLOR || '#7F7F7F';
                LINE_COLOR = scope.options.LINE_COLOR || '#D0D0D0';
                FONT_SIZE = scope.options.FONT_SIZE || 10;
                FONT_WEIGHT = scope.options.FONT_WEIGHT || 100;
            };

            var drawLabels = function() {
                for (var y=0; y<scope.ylabels.length; y++) {
                    svg.append('svg:text')
                        .attr('class', 'ylabel')
                        .attr('x', LABEL_LEFT)
                        .attr('y', (y + 1) * LINE_SIZE_Y + PADDING_TOP)
                        .attr('dy', '0.25em')
                        .attr('text-anchor', 'end')
                        .style('font-family', 'Helvetica')
                        .style('font-size', FONT_SIZE)
                        .style('font-weight', FONT_WEIGHT)
                        .style('fill', LABEL_COLOR)
                        .text(scope.ylabels[y]);

                    svg.append('svg:line')
                        .attr('class', 'line')
                        .attr('x1', (1) * LABEL_LEFT + 0.25 * LABEL_LEFT)
                        .attr('y1', (y + 1) * LINE_SIZE_Y + PADDING_TOP)
                        .attr('x2', (1 + scope.xlabels.length) * LINE_SIZE_X + 0.75 * LINE_SIZE_X)
                        .attr('y2', (y + 1) * LINE_SIZE_Y + PADDING_TOP)
                        .style('stroke', LINE_COLOR)
                        .style('stroke-width', 0.5);
                }

                for (var x=0; x<scope.xlabels.length; x++) {
                    svg.append('svg:text')
                        .attr('class', 'xlabel')
                        .attr('x', (x + 1) * LINE_SIZE_X + LABEL_LEFT)
                        .attr('y', (scope.ylabels.length + 1) * LINE_SIZE_Y + PADDING_TOP)
                        .attr('text-anchor', 'middle')
                        .style('font-family', 'Helvetica')
                        .style('font-size', FONT_SIZE)
                        .style('font-weight', FONT_WEIGHT)
                        .style('fill', LABEL_COLOR)
                        .text(scope.xlabels[x]);

                    svg.append('svg:line')
                        .attr('class', 'line')
                        .attr('x1', (x + 1) * LINE_SIZE_X + LABEL_LEFT)
                        .attr('y1', (1) * LINE_SIZE_Y + PADDING_TOP - 0.75 * LINE_SIZE_Y)
                        .attr('x2', (x + 1) * LINE_SIZE_X + LABEL_LEFT)
                        .attr('y2', (1 + scope.ylabels.length) * LINE_SIZE_Y + PADDING_TOP - 0.25 * LINE_SIZE_Y)
                        .style('stroke', LINE_COLOR)
                        .style('stroke-width', 0.5);
                }
            };

            var drawContent = function() {

                for (var y=0; y<yAxisLength && y<scope.ylabels.length; y++) {
                    for (var x=0; x<xAxisLength && x<scope.xlabels.length; x++) {
                        svg.append('svg:circle')
                            .attr('class', 'circle')
                            .attr('cx', (x + 1) * LINE_SIZE_X + LABEL_LEFT)
                            .attr('cy', (y + 1) * LINE_SIZE_Y + PADDING_TOP)
                            .attr('r', scope.chartData[y][x] / valueScaleFactor)
                            .attr('data', scope.chartData[y][x])
                            .attr('fill', PUNCT_COLOR)
                            .on('mouseover', function(){
                                tip.html(d3.select(this).attr('data'));
                                tip.show();
                            })
                            .on('mouseout', tip.hide);
                    }
                }
            };

            var redraw = function() {
                svg.selectAll('*').remove();

                init();
                drawLabels();
                drawContent();
            };

            scope.$watch('chartData', function(value, old) {
                if (value !== old) {
                    redraw();
                }
            });

            scope.$watch('xlabels', function(value, old) {
                if (value !== old) {
                    redraw();
                }
            });

            scope.$watch('ylabels', function(value, old) {
                if (value !== old) {
                    redraw();
                }
            });

            scope.$watch('options', function(value, old) {
                if (value !== old) {
                    redraw();
                }
            });

            redraw();
        }
    };
});
})();