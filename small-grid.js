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
                    newConfig.cellTemplate = function (column, value) {
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
                cell.html(config.cellTemplate(column, row[column.field]));
                cell.css('width', column.width);
                cell.css('height', config.cellHeight);
                return cell;
            }

            function createColumn(column) {
                var columnDiv = $('<div class="column"></div>');
                columnDiv.css('width', column.width);
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
                headCell.css('width', column.width);
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
                    $('.pinned-left').css('margin-top', -scrollTop);
                });

                $('.header').css('height', config.headerHeight);
                config.columns.forEach(function (column) {
                    if (!column.visible) return;

                    var headCell = createHeaderCell(column);
                    $('.header').append(headCell);

                    var columnDiv = createColumn(column);
                    body.append(columnDiv);

                    if (column.pinned === 'left') $scope.smallGridPinLeft(column.field);
                });
            }

            function sumWidthPinnedLeft() {
                var r = 0;
                config.columns.forEach(function (column) {
                    if (column.pinned === 'left') r += column.width;
                });
                return r;
            }

            $scope.smallGridPinLeft = function (field) {
                var column = findColumn(field);
                column.pinned = 'left';

                var left = 0;
                config.columns.forEach(function (column) {
                    if (column.pinned === 'left' && column.field != field) left += column.width;
                });

                var sumLeft = sumWidthPinnedLeft();

                $('.header').css('margin-left', sumLeft);
                $('.body').css('margin-left', sumLeft);

                var headCellDiv = findHeadCellDiv(field).detach();
                var columnDiv = findColumnDiv(field).detach();

                columnDiv.css('position', 'absolute');
                columnDiv.css('top', config.headerHeight);
                columnDiv.css('left', left);
                columnDiv.css('overflow', 'hidden');
                columnDiv.addClass('pinned-left');
                $('.table').append(columnDiv);

                headCellDiv.css('position', 'absolute');
                headCellDiv.css('top', 0);
                headCellDiv.css('left', left);
                $('.table').append(headCellDiv);
            };

            $scope.smallGridUnpinLeft = function (field) {
                var column = findColumn(field);
                column.pinned = void 0;

                var sumLeft = sumWidthPinnedLeft();

                $('.header').css('margin-left', sumLeft);
                $('.body').css('margin-left', sumLeft);
                // $('.header').css('width', '');
                // $('.body').css('width', '');

                var headCellDiv = findHeadCellDiv(field);
                headCellDiv.detach();
                headCellDiv.css('position', '');
                headCellDiv.css('top', '');
                headCellDiv.css('left', '');

                var columnDiv = findColumnDiv(field);
                columnDiv.detach();
                columnDiv.removeClass('pinned-left');
                columnDiv.css('position', '');
                columnDiv.css('top', '');
                columnDiv.css('left', '');
                columnDiv.css('overflow', '');

                var prevColumn = findPreviousColumn(field);
                var nextColumn = findNextColumn(field);

                if (nextColumn) {
                    findColumnDiv(nextColumn.field).before(columnDiv);
                    findHeadCellDiv(nextColumn.field).before(headCellDiv);
                } else {
                    findColumnDiv(nextColumn.field).before(columnDiv);
                    findHeadCellDiv(prevColumn.field).before(headCellDiv);
                }
            };

            $scope.smallGridFindColumn = function (field) {
                return findColumn(field);
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

            function jqueryColumnId(field) {
                return '#column-' + field;
            }

            function findColumnDiv(field) {
                return $(jqueryColumnId(field));
            }

            function findHeadCellDiv(field) {
                return $('#headCell-' + field);
            }

            $scope.smallGridShowColumn = function (field) {
                var column = findColumn(field);
                if (column.pinned) return;
                column.visible = true;

                var prevColumn = findPreviousColumn(column.field);
                var nextColumn = findNextColumn(column.field);

                var columnDiv = createColumn(column);
                populateColumn(column, columnDiv);
                var cellHeaderDiv = createHeaderCell(column);
                if (nextColumn) {
                    findColumnDiv(nextColumn.field).before(columnDiv);
                    findHeadCellDiv(nextColumn.field).before(cellHeaderDiv);
                } else {
                    findColumnDiv(nextColumn.field).before(columnDiv);
                    findHeadCellDiv(prevColumn.field).before(cellHeaderDiv);
                }
            };

            $scope.smallGridHideColumn = function (field) {
                var column = findColumn(field);
                if (column.pinned) return;
                column.visible = false;

                $('#column-' + field).remove();
                $('#headCell-' + field).remove();
            };
        }
    };
}]);