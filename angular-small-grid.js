(function () {
    angular.module('angularSmallGrid', []).directive('angularSmallGrid', ['$compile', function ($compile) {
        return {
            restrict: 'E',
            template: '<div class="angular-small-grid-table"><div class="angular-small-grid-header"></div><div class="angular-small-grid-body"></div></div>',
            link: function ($scope, $element, $attrs) {
                var config = void 0;
                var data = void 0;
                var draggedColumnField = void 0;
                var resizeInProgress = void 0;

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

                    if (!newConfig.noDataTemplate) {
                        newConfig.noDataTemplate = '<div>No Data</div>';
                    }

                    // empty default listener
                    if (!newConfig.onOrderChange) newConfig.onOrderChange = function () {
                    };

                    config = newConfig;
                    restoreColumnsSettings();
                    createTable();
                    if (data) populateData();
                });

                function removeData() {
                    // console.log('remove data');
                    hideNoData();

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
                    // console.log('populate table with data:');
                    // console.log(data);

                    hideNoData();

                    config.columns.forEach(function (column) {
                        findColumnDiv(column.field).empty();
                    });

                    config.columns.forEach(function (column) {
                        populateColumn(column, findColumnDiv(column.field));
                    });

                    hideLoader();

                    if (data && data.length === 0) showNoData();
                }

                function createCell(column, row) {
                    var cell = $('<div class="angular-small-grid-cell"></div>');
                    cell.html(config.cellTemplate(column, row[column.field]));
                    cell.css('height', config.cellHeight);
                    return cell;
                }

                function createColumn(column) {
                    var columnDiv = $('<div class="angular-small-grid-column"></div>');
                    columnDiv.attr('id', 'angular-small-grid-column-' + column.field);
                    columnDiv.css('width', column.width);
                    columnDiv.css('display', 'inline-block');
                    return columnDiv;
                }

                function createHeaderCell(column) {
                    var headCell = $('<div class="angular-small-grid-header-cell" draggable="true"></div>');

                    headCell.on('dragstart', function (e) {
                        draggedColumnField = void 0;
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

                        var elementTargetIndex = $(e.target).index();
                        var columnTargetIndex = countOfPinnedLeft() + elementTargetIndex;
                        var targetField = config.columns[columnTargetIndex].field;
                        if (draggedColumnField === targetField) return;

                        $('.angular-small-grid-header-cell').eq(elementTargetIndex).before(findHeadCellDiv(draggedColumnField));
                        $('.angular-small-grid-column').eq(elementTargetIndex).before(findColumnDiv(draggedColumnField));

                        var draggedIndex = findColumnIndex(draggedColumnField);
                        var draggedColumn = config.columns[draggedIndex];
                        config.columns.splice(draggedIndex, 1); // remove column from old position
                        var newTargetIndex = findColumnIndex(targetField);
                        config.columns.splice(newTargetIndex, 0, draggedColumn); // add column before
                        storeColumnSettings();

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

                    var resizer = $('<div class="angular-small-grid-resizer"></div>');
                    resizer.mousedown(function (e) {
                        resizeInProgress = {element: headCell, x: e.clientX, column: column};
                        $('.angular-small-grid-header').addClass('angular-small-grid-resize-cursor');
                        $(document).one('mouseup', function (e) {
                            if (resizeInProgress) {
                                var columnMinWidth = resizeInProgress.column.minWidth ? resizeInProgress.column.minWidth : 50;
                                var width = Math.max(columnMinWidth, resizeInProgress.column.width + e.clientX - resizeInProgress.x);

                                resizeInProgress.column.width = width;
                                storeColumnSettings();
                                resizeInProgress.element.css('width', width);
                                findColumnDiv(resizeInProgress.column.field).css('width', width);
                                $('.angular-small-grid-header').removeClass('angular-small-grid-resize-cursor');
                                resizeInProgress = void 0;
                            }
                        });
                        e.preventDefault();
                    });
                    headCell.append(resizer);

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

                function showNoData() {
                    hideNoData();
                    var noData = $(config.noDataTemplate);
                    noData.attr('id', 'angular-small-grid-no-data');
                    noData.css('top', config.headerHeight);
                    noData.addClass('angular-small-grid-no-data');
                    $('.angular-small-grid-table').append(noData);
                }

                function hideLoader() {
                    $('.angular-small-grid-loader').remove();
                }

                function hideNoData() {
                    $('.angular-small-grid-no-data').remove();
                }

                function createTable() {
                    // console.log('create table with config:');
                    // console.log(config);

                    $('.angular-small-grid-header').empty();
                    $('.angular-small-grid-header-cell').remove();
                    $('.angular-small-grid-body').empty();
                    $('.angular-small-grid-column').remove();

                    showLoader();

                    var body = $('.angular-small-grid-body');
                    body.css('top', config.headerHeight);

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

                        if (column.pinned === 'left') {
                            column.pinned = void 0;
                            $scope.angularSmallGridPinLeft(column.field);
                        }
                    });
                }

                function sumWidthPinnedLeft() {
                    var r = 0;
                    config.columns.forEach(function (column) {
                        if (column.pinned === 'left') r += column.width;
                    });
                    return r;
                }

                function countOfPinnedLeft() {
                    var r = 0;
                    config.columns.forEach(function (column) {
                        if (column.pinned === 'left') r++;
                    });
                    return r;
                }

                function sumWidthPinnedLeftBefore(field) {
                    var r = 0;
                    for (var c = 0; c < config.columns.length; c++) {
                        var column = config.columns[c];
                        if (column.field === field) break;
                        if (column.pinned === 'left') r += column.width;
                    }
                    return r;
                }

                function findColumn(field) {
                    var r = void 0;
                    if (config) {
                        config.columns.forEach(function (column) {
                            if (column.field === field) r = column;
                        });
                    }
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
                    if (column.pinned || column.visible) return;
                    column.visible = true;
                    storeColumnSettings();

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
                    if (column.pinned || !column.visible) return;
                    column.visible = false;
                    storeColumnSettings();

                    findColumnDiv(field).remove();
                    findHeadCellDiv(field).remove();
                };

                $scope.angularSmallGridPinLeft = function (field) {
                    var column = findColumn(field);
                    if (!column.visible || column.pinned) return;

                    column.pinned = 'left';
                    storeColumnSettings();

                    var beforeLeft = sumWidthPinnedLeftBefore(field);
                    var allLeft = sumWidthPinnedLeft();

                    $('.angular-small-grid-header').css('margin-left', allLeft);
                    $('.angular-small-grid-body').css('margin-left', allLeft);

                    var headCellDiv = findHeadCellDiv(field).detach();
                    var columnDiv = findColumnDiv(field).detach();

                    columnDiv.css('margin-top', -$('.angular-small-grid-body').scrollTop());
                    columnDiv.css('position', 'absolute');
                    columnDiv.css('top', config.headerHeight);
                    columnDiv.css('left', beforeLeft);
                    columnDiv.css('overflow', 'hidden');
                    columnDiv.addClass('pinned-left');
                    $('.angular-small-grid-table').append(columnDiv);

                    headCellDiv.css('position', 'absolute');
                    headCellDiv.css('top', 0);
                    headCellDiv.css('left', beforeLeft);
                    $('.angular-small-grid-table').append(headCellDiv);
                };

                $scope.angularSmallGridUnpinLeft = function (field) {
                    var column = findColumn(field);
                    if (!column.visible || !column.pinned) return;

                    column.pinned = void 0;
                    storeColumnSettings();

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
                    columnDiv.css('margin-top', '');
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

                /**
                 * Find column from config.columns by column.field
                 *
                 * @param field - column.field
                 * @returns {*} column from grid config or void 0
                 */
                $scope.angularSmallGridFindColumn = function (field) {
                    return findColumn(field);
                };

                function restoreColumnsSettings() {
                    if (config && config.localStorageKey) {
                        var json = window.localStorage.getItem(config.localStorageKey);
                        var configToRestore = JSON.parse(json);
                        if (configToRestore) {
                            var sortedColumns = [];
                            configToRestore.forEach(function (columnToRestore) {
                                var column = findColumn(columnToRestore.field);
                                if (column) {
                                    column.width = columnToRestore.width;
                                    column.visible = columnToRestore.visible;
                                    column.pinned = columnToRestore.pinned;
                                    sortedColumns.push(column);
                                }
                            });

                            // add other unsorted
                            config.columns.forEach(function (column) {
                                if (sortedColumns.indexOf(column) < 0) sortedColumns.push(column);
                            });

                            config.columns = sortedColumns;
                        }
                    }
                }

                function storeColumnSettings() {
                    if (config && config.localStorageKey) {
                        var configToStore = [];
                        config.columns.forEach(function (column) {
                            configToStore.push({
                                field: column.field,
                                width: column.width,
                                visible: column.visible,
                                pinned: column.pinned
                            });
                        });
                        window.localStorage.setItem(config.localStorageKey, JSON.stringify(configToStore));
                    }
                }
            }
        };
    }]);
}());