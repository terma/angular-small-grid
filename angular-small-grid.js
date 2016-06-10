(function () {
    angular.module('angularSmallGrid', []).directive('angularSmallGrid', ['$compile', function ($compile) {
        return {
            restrict: 'E',
            template: '<div class="angular-small-grid-table"><div class="angular-small-grid-header"></div><div class="angular-small-grid-body"></div></div>',
            link: function ($scope, $element, $attrs) {
                var config = void 0;
                var data = void 0;
                var draggedColumnField = void 0;

                $scope.$watch($attrs.asgData, function (newData) {
                    data = newData;
                    if (config) {
                        if (data) populateData();
                        else removeData();
                    }
                });

                $scope.$watch($attrs.asgConfig, function (newConfig) {
                    if (!newConfig.cellTemplate) {
                        newConfig.cellTemplate = function (column, value) {
                            return value;
                        };
                    }

                    if (!newConfig.loaderTemplate) {
                        newConfig.loaderTemplate = '<div>Loading...</div>';
                    }

                    // empty default listener
                    if (!newConfig.onOrderChange) newConfig.onOrderChange = function () {
                    };

                    config = newConfig;
                    createTable();
                    if (data) populateData();
                });

                function removeData() {
                    console.log('remove data');

                    config.columns.forEach(function (column) {
                        findColumnDiv(column.field).empty();
                    });

                    showLoader();
                }

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
                        populateColumn(column, findColumnDiv(column.field));
                    });

                    hideLoader();
                }

                function createCell(column, row) {
                    var cell = $('<div class="angular-small-grid-cell"></div>');
                    cell.html(config.cellTemplate(column, row[column.field]));
                    cell.css('width', column.width);
                    cell.css('height', config.cellHeight);
                    return cell;
                }

                function createColumn(column) {
                    var columnDiv = $('<div class="column"></div>');
                    columnDiv.attr('id', 'angular-small-grid-column-' + column.field);
                    columnDiv.css('width', column.width);
                    columnDiv.css('display', 'inline-block');
                    return columnDiv;
                }

                function createHeaderCell(column) {
                    var headCell = $('<div class="angular-small-grid-header-cell" draggable="true"></div>');

                    headCell.on('dragstart', function (e) {
                        var field = $(e.target).data('field');
                        if (findColumn(field).pinned) e.preventDefault();
                        else draggedColumnField = field;
                    });
                    headCell.on('dragover', function (e) {
                        e.preventDefault();
                    });
                    headCell.on('drop', function (e) {
                        e.preventDefault();

                        if (!draggedColumnField) return;

                        var targetIndex = $(e.target).index();
                        var columns = $('.column');
                        var headerCells = $('.angular-small-grid-header-cell');
                        $(headerCells[targetIndex]).before(findHeadCellDiv(draggedColumnField));
                        $(columns[targetIndex]).before(findColumnDiv(draggedColumnField));

                        var draggedIndex = findColumnIndex(draggedColumnField);
                        var temp = config.columns[draggedIndex];
                        config.columns[draggedIndex] = config.columns[targetIndex];
                        config.columns[targetIndex] = temp;

                        config.onOrderChange(draggedColumnField);
                        draggedColumnField = void 0;
                        $scope.$apply();
                    });

                    headCell.attr('id', 'angular-small-grid-header-cell-' + column.field);
                    headCell.data('field', column.field);
                    if (column.headerTemplate) {
                        headCell.append($compile(column.headerTemplate)($scope));
                    } else {
                        headCell.html(column.name);
                    }
                    headCell.css('width', column.width);
                    headCell.css('height', config.headerHeight);
                    return headCell;
                }

                function showLoader() {
                    hideLoader();

                    var loader = $(config.loaderTemplate);
                    loader.attr('id', 'angular-small-grid-loader');
                    loader.css('top', config.headerHeight);
                    loader.addClass('angular-small-grid-loader');
                    $('.angular-small-grid-table').append(loader);
                }

                function hideLoader() {
                    $('.angular-small-grid-loader').remove();
                }

                function createTable() {
                    console.log('create table with config:');
                    console.log(config);

                    showLoader();

                    var body = $('.angular-small-grid-body');
                    $('.angular-small-grid-body').scroll(function () {
                        var scrollLeft = body.scrollLeft();
                        $('.angular-small-grid-header-cell').eq(0).css('margin-left', -scrollLeft);

                        var scrollTop = body.scrollTop();
                        $('.pinned-left').css('margin-top', -scrollTop);
                    });

                    $('.angular-small-grid-header').css('height', config.headerHeight);
                    config.columns.forEach(function (column) {
                        if (!column.visible) return;

                        var headCell = createHeaderCell(column);
                        $('.angular-small-grid-header').append(headCell);

                        var columnDiv = createColumn(column);
                        body.append(columnDiv);

                        if (column.pinned === 'left') $scope.angularSmallGridPinLeft(column.field);
                    });
                }

                function sumWidthPinnedLeft() {
                    var r = 0;
                    config.columns.forEach(function (column) {
                        if (column.pinned === 'left') r += column.width;
                    });
                    return r;
                }

                $scope.angularSmallGridPinLeft = function (field) {
                    var column = findColumn(field);
                    column.pinned = 'left';

                    var left = 0;
                    config.columns.forEach(function (column) {
                        if (column.pinned === 'left' && column.field != field) left += column.width;
                    });

                    var sumLeft = sumWidthPinnedLeft();

                    $('.angular-small-grid-header').css('margin-left', sumLeft);
                    $('.angular-small-grid-body').css('margin-left', sumLeft);

                    var headCellDiv = findHeadCellDiv(field).detach();
                    var columnDiv = findColumnDiv(field).detach();

                    columnDiv.css('position', 'absolute');
                    columnDiv.css('top', config.headerHeight);
                    columnDiv.css('left', left);
                    columnDiv.css('overflow', 'hidden');
                    columnDiv.addClass('pinned-left');
                    $('.angular-small-grid-table').append(columnDiv);

                    headCellDiv.css('position', 'absolute');
                    headCellDiv.css('top', 0);
                    headCellDiv.css('left', left);
                    $('.angular-small-grid-table').append(headCellDiv);
                };

                $scope.angularSmallGridUnpinLeft = function (field) {
                    var column = findColumn(field);
                    column.pinned = void 0;

                    var sumLeft = sumWidthPinnedLeft();

                    $('.angular-small-grid-header').css('margin-left', sumLeft);
                    $('.angular-small-grid-body').css('margin-left', sumLeft);

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

                $scope.angularSmallGridFindColumn = function (field) {
                    return findColumn(field);
                };

                function findColumn(field) {
                    var r = void 0;
                    config.columns.forEach(function (column) {
                        if (column.field === field) r = column;
                    });
                    return r;
                }

                function findColumnIndex(field) {
                    for (var c = 0; c < config.columns.length; c++) {
                        if (config.columns[c].field === field) return c;
                    }
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
                    return '#angular-small-grid-column-' + field;
                }

                function findColumnDiv(field) {
                    return $(jqueryColumnId(field));
                }

                function findHeadCellDiv(field) {
                    return $('#angular-small-grid-header-cell-' + field);
                }

                $scope.angularSmallGridShowColumn = function (field) {
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

                $scope.angularSmallGridHideColumn = function (field) {
                    var column = findColumn(field);
                    if (column.pinned) return;
                    column.visible = false;

                    findColumnDiv(field).remove();
                    findHeadCellDiv(field).remove();
                };
            }
        };
    }]);
}());