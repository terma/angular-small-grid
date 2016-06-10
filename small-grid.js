var myapp = angular.module('app', []);

myapp.directive('smallGrid', ['$compile', function ($compile) {
    return {
        restrict: 'E',
        templateUrl: 'template.html',
        link: function ($scope, $element, $attrs) {
            var config = void 0;
            var data = void 0;

            $scope.$watch($attrs.sgData, function (newData) {
                data = newData;
                if (config) populateData();
            });

            $scope.$watch($attrs.sgConfig, function (newConfig) {
                if (!newConfig.cellTemplate) {
                    newConfig.cellTemplate = function (value) {
                        return value;
                    };
                }

                config = newConfig;
                createTable();
                if (data) populateData();
            });

            function populateColumn(column, columnDiv) {
                var cells = [];
                data.forEach(function (rowData) {
                    var cell = createCell(column, rowData);
                    cells.push(cell);
                });
                columnDiv.append(cells);
            }

            function populateData() {
                console.log('populate table with data:');
                console.log(data);

                config.columns.forEach(function (column) {
                    populateColumn(column, $('#column-' + column.field));
                });
            }

            function createCell(column, row) {
                var cell = $('<div class="cell"></div>');
                cell.html(config.cellTemplate(row[column.field]));
                cell.css('width', config.cellWidth);
                cell.css('height', config.cellHeight);
                return cell;
            }

            function createColumn(column) {
                var columnDiv = $('<div class="column"></div>');
                columnDiv.css('width', config.cellWidth);
                columnDiv.attr('id', 'column-' + column.field);
                columnDiv.css('display', 'inline-block');
                return columnDiv;
            }

            function createHeaderCell(column) {
                var headCell = $('<div class="headCell" draggable="true"></div>');
                headCell.on('dragstart', function (e) {
                    draggedColumnIndex = $(e.target).index();
                });
                headCell.on('dragover', function (e) {
                    e.preventDefault();
                });
                headCell.on('drop', function (e) {
                    e.preventDefault();
                    var targetIndex = $(e.target).index();
                    var columns = $('.column');
                    $(columns[targetIndex]).before(columns[draggedColumnIndex]);
                });
                headCell.attr('id', 'headCell-' + column.field);
                if (column.headerTemplate) {
                    headCell.append($compile(column.headerTemplate)($scope));
                } else {
                    headCell.html(column.name);
                }
                headCell.css('width', config.cellWidth);
                headCell.css('height', config.headerHeight);
                return headCell;
            }

            function createTable() {
                console.log('create table with config:');
                console.log(config);

                var body = $('.body');
                $('.body').scroll(function (e) {
                    var scrollLeft = body.scrollLeft();
                    $('.headCell').eq(0).css('margin-left', -scrollLeft);

                    var scrollTop = body.scrollTop();
                    pinnedColumns.forEach(function (column) {
                        column.css('margin-top', -scrollTop);
                    });
                });

                $('.header').css('height', config.headerHeight);
                config.columns.forEach(function (column) {
                    if (!column.visible) return;

                    var headCell = createHeaderCell(column);
                    $('.header').append(headCell);

                    var columnDiv = createColumn(column);
                    body.append(columnDiv);
                });
            }

            var pinLeftToggler = false;
            var pinnedHeadCells = [];
            var pinnedColumns = [];

            function pinLeft(index) {
                $('.header').css('margin-left', config.cellWidth);
                $('.body').css('margin-left', config.cellWidth);
                // var width = $('.body').css('width').replace('px', '');
                // $('.header').css('width', width - config.cellWidth);
                // $('.body').css('width', width - config.cellWidth);

                var headCell = $('.headCell').eq(index).detach();
                var column = $('.column').eq(index).detach();

                column.css('position', 'absolute');
                column.css('top', config.headerHeight);
                column.css('left', 0);
                column.css('overflow', 'hidden');
                $('.table').append(column);

                headCell.css('position', 'absolute');
                headCell.css('top', 0);
                headCell.css('left', 0);
                $('.table').append(headCell);

                pinnedColumns.push(column);
                pinnedHeadCells.push(headCell);
            }

            function unpinLeft(index) {
                $('.header').css('margin-left', '');
                $('.body').css('margin-left', '');
                $('.header').css('width', '');
                $('.body').css('width', '');

                var headCell = pinnedHeadCells.pop();
                headCell.detach();
                headCell.css('position', '');
                headCell.css('top', '');
                headCell.css('left', '');
                $('.headCell').eq(index).before(headCell);

                var column = pinnedColumns.pop();
                column.detach();
                column.css('position', '');
                column.css('top', '');
                column.css('left', '');
                column.css('overflow', '');
                $('.column').eq(index).before(column);
            }

            $scope.pinLeft = function (index) {
                if (!pinLeftToggler) pinLeft(index);
                else unpinLeft(index);
                pinLeftToggler = !pinLeftToggler;
            };

            function findColumn(field) {
                var r = void 0;
                config.columns.forEach(function (column) {
                    if (column.field === field) r = column;
                });
                return r;
            }

            function findPreviousColumn(field) {
                for (var c = 1; c < config.columns.length; c++) {
                    if (config.columns[c].field === field) return config.columns[c - 1];
                }
            }

            function findNextColumn(field) {
                for (var c = 0; c < config.columns.length - 1; c++) {
                    if (config.columns[c].field === field) return config.columns[c + 1];
                }
            }

            function showColumn(field) {
                var column = findColumn(field);
                var prevColumn = findPreviousColumn(column.field);
                var nextColumn = findNextColumn(column.field);

                var columnDiv = createColumn(column);
                populateColumn(column, columnDiv);
                var cellHeaderDiv = createHeaderCell(column);
                if (nextColumn) {
                    $('#column-' + nextColumn.field).before(columnDiv);
                    $('#headCell-' + nextColumn.field).before(cellHeaderDiv);
                } else {
                    $('#column-' + prevColumn.field).before(columnDiv);
                    $('#headCell-' + prevColumn.field).before(cellHeaderDiv);
                }
            }

            function hideColumn(field) {
                $('#column-' + field).remove();
                $('#headCell-' + field).remove();
            }

            $scope.toggleV = function () {
                if (!config.columns[1].visible) {
                    showColumn('column1');
                } else {
                    hideColumn('column1');
                }
                config.columns[1].visible = !config.columns[1].visible;
            };
        }
    };
}]);