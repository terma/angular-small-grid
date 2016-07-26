(function () {
    angular.module('angularSmallGrid', []).directive('angularSmallGrid',
        ['$compile', '$templateCache', function ($compile, $templateCache) {
            return {
                restrict: 'E',
                template: '<div class="angular-small-grid-table"><div class="angular-small-grid-header"></div><div class="angular-small-grid-body"></div></div>',
                link: function ($scope, $element, $attrs) {
                    var config = void 0;
                    var data = void 0;
                    var resizeInProgress = void 0;

                    // cache elements
                    var angularSmallGridBody = $($element).find('.angular-small-grid-body');
                    var angularSmallGridHeader = $($element).find('.angular-small-grid-header');

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
                        // todo check if data is present
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
                        if (config.onCellClick) cell.click(function (e) {
                            $scope.$apply(function () {
                                config.onCellClick(column, row, e);
                            });
                        });
                        return cell;
                    }

                    function createColumn(column) {
                        var columnDiv = $('<div class="angular-small-grid-column"></div>');
                        columnDiv.attr('id', 'angular-small-grid-column-' + column.field);
                        columnDiv.css('width', column.width);
                        columnDiv.css('display', 'inline-block');
                        if (column.class) columnDiv.addClass(column.class);
                        return columnDiv;
                    }

                    function findHeaderCellAsParent(element) {
                        return $(element).closest('.angular-small-grid-header-cell');
                    }

                    function createHeaderCell(column) {
                        var headCell = $('<div class="angular-small-grid-header-cell" draggable="true"></div>');

                        var angularSmallGridBodyLeft = void 0;
                        var windowRight = void 0;
                        var offset = 100;
                        var step = 15;

                        headCell.on('drag', function (e) {
                            function scrollHorizontally(step) {
                                var scrollX = angularSmallGridBody.scrollLeft();
                                angularSmallGridBody.scrollLeft(scrollX + step);
                            }

                            var xpos = e.originalEvent.clientX;
                            if (xpos < angularSmallGridBodyLeft + offset) scrollHorizontally(-step);
                            // todo possible defect when table size less than windowRight - offset
                            if (xpos > windowRight - offset) scrollHorizontally(step);
                        });

                        headCell.on('dragstart', function (e) {
                            draggedColumnField = void 0;
                            var field = $(e.target).data('field');
                            if (findColumn(field).pinned) e.preventDefault();
                            else {
                                draggedColumnField = field;
                                // e.originalEvent.dataTransfer.cursor
                            }

                            angularSmallGridBodyLeft = angularSmallGridBody.offset().left;
                            windowRight = $(window).width();
                        });
                        headCell.on('dragenter', function (e) {
                            var currentHeadCell = findHeaderCellAsParent(e.target);
                            $('.angular-small-grid-cell-to-drag').hide();
                            currentHeadCell.find('.angular-small-grid-cell-to-drag').show();
                            // e.preventDefault();
                        });
                        headCell.on('dragend', function () {
                            $('.angular-small-grid-cell-to-drag').hide();
                        });
                        headCell.on('dragover', function (e) {
                            e.preventDefault();
                        });
                        headCell.on('drop', function (e) {
                            e.preventDefault();

                            if (!draggedColumnField) return;

                            $('.angular-small-grid-cell-to-drag').hide();

                            var targetElement = findHeaderCellAsParent(e.target);
                            var targetField = targetElement.data('field');
                            var targetColumn = findColumn(targetField);
                            if (targetColumn.pinned || draggedColumnField === targetField) return;

                            findHeadCellDiv(targetField).before(findHeadCellDiv(draggedColumnField));
                            findColumnDiv(targetField).before(findColumnDiv(draggedColumnField));

                            var draggedIndex = findColumnIndex(draggedColumnField);
                            var draggedColumn = config.columns[draggedIndex];
                            config.columns.splice(draggedIndex, 1); // remove column from old position
                            var targetIndex = findColumnIndex(targetField);
                            config.columns.splice(targetIndex, 0, draggedColumn); // add column before
                            storeColumnSettings();
                            draggedColumnField = void 0;

                            $scope.$apply(function () {
                                config.onOrderChange(draggedColumnField);
                            });
                        });

                        headCell.attr('id', 'angular-small-grid-header-cell-' + column.field);
                        headCell.data('field', column.field);

                        if (column.headerTemplateUrl || column.headerTemplate) {
                            var template = column.headerTemplateUrl ? $templateCache.get(column.headerTemplateUrl) : column.headerTemplate;
                            var headerScope = $scope.$new();
                            headerScope.column = column;
                            headCell.append($compile(template)(headerScope));
                        } else {
                            headCell.html(column.name);
                        }

                        if (column.class) headCell.addClass(column.class);

                        // fix to disable drag when cursor on input to be able select instead of drag
                        headCell.find('input').on('mouseenter', function () {
                            headCell.attr('draggable', '');
                        });
                        headCell.find('input').on('mouseleave', function () {
                            headCell.attr('draggable', 'true');
                        });

                        var cellToDrag = $('<div class="angular-small-grid-cell-to-drag"></div>');
                        headCell.append(cellToDrag);

                        if (!column.fixedWidth) {
                            var resizer = $('<div class="angular-small-grid-resizer"></div>');
                            resizer.mousedown(function (e) {
                                resizeInProgress = {element: headCell, x: e.clientX, column: column};
                                angularSmallGridHeader.addClass('angular-small-grid-resize-cursor');
                                $(document).one('mouseup', function (e) {
                                    if (resizeInProgress) {
                                        var columnMinWidth = resizeInProgress.column.minWidth ? resizeInProgress.column.minWidth : 50;
                                        var width = Math.max(columnMinWidth, resizeInProgress.column.width + e.clientX - resizeInProgress.x);

                                        resizeInProgress.column.width = width;
                                        storeColumnSettings();
                                        resizeInProgress.element.css('width', width);
                                        findColumnDiv(resizeInProgress.column.field).css('width', width);
                                        angularSmallGridHeader.removeClass('angular-small-grid-resize-cursor');
                                        resizeInProgress = void 0;
                                    }
                                });
                                e.preventDefault();
                            });
                            headCell.append(resizer);
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

                        angularSmallGridHeader.empty();
                        $('.angular-small-grid-header-cell').remove();
                        angularSmallGridBody.empty();
                        $('.angular-small-grid-column').remove();

                        showLoader();

                        angularSmallGridBody.css('top', config.headerHeight);

                        angularSmallGridBody.scroll(function () {
                            var scrollLeft = angularSmallGridBody.scrollLeft();
                            $('.angular-small-grid-header-cell').eq(0).css('margin-left', -scrollLeft);

                            var scrollTop = angularSmallGridBody.scrollTop();
                            $('.pinned-left').css('margin-top', -scrollTop);
                        });

                        angularSmallGridHeader.css('height', config.headerHeight);
                        config.columns.forEach(function (column) {
                            if (!column.visible) return;

                            var headCell = createHeaderCell(column);
                            angularSmallGridHeader.append(headCell);

                            var columnDiv = createColumn(column);
                            angularSmallGridBody.append(columnDiv);

                            if (column.pinned === 'left') pinToLeft(column.field);
                        });
                    }

                    function sumWidthPinnedLeft() {
                        var r = 0;
                        config.columns.forEach(function (column) {
                            if (column.pinned === 'left') r += column.width;
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
                            // todo find previously visible column
                            if (config.columns[c].field === field) return config.columns[c - 1];
                        }
                    }

                    function findNextColumn(field) {
                        // todo find next visible column
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

                    function pinToLeft(field) {
                        var beforeLeft = sumWidthPinnedLeftBefore(field);
                        var allLeft = sumWidthPinnedLeft();

                        angularSmallGridHeader.css('margin-left', allLeft);
                        angularSmallGridBody.css('margin-left', allLeft);

                        var headCellDiv = findHeadCellDiv(field).detach();
                        var columnDiv = findColumnDiv(field).detach();

                        columnDiv.css('margin-top', -angularSmallGridBody.scrollTop());
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
                    }

                    $scope.angularSmallGridPinLeft = function (field) {
                        var column = findColumn(field);
                        if (!column.visible || column.pinned) return;

                        column.pinned = 'left';
                        storeColumnSettings();
                        pinToLeft(field);
                    };

                    $scope.angularSmallGridUnpinLeft = function (field) {
                        var column = findColumn(field);
                        if (!column.visible || !column.pinned) return;

                        column.pinned = void 0;
                        storeColumnSettings();

                        var sumLeft = sumWidthPinnedLeft();

                        angularSmallGridHeader.css('margin-left', sumLeft);
                        angularSmallGridBody.css('margin-left', sumLeft);

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