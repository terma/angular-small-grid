var myapp = angular.module('app', []);

myapp.directive('smallGrid', [function () {
    return {
        restrict: 'E',
        templateUrl: 'template.html',
        link: function ($scope, $element) {
            var config = {
                headerHeight: 30,
                cellHeight: 30,
                cellWidth: 100
            };

            $scope.columns = [];
            for (var j = 0; j < 30; j++) {
                $scope.columns.push({visible: true});
            }
            $scope.data = [];
            for (var i = 0; i < 100; i++) {
                var row = [];
                for (var j = 0; j < 30; j++) {
                    row.push('Some text more then size of cell opa');
                }
                $scope.data.push(row);
            }

            function createColumn(index) {
                var column = $('<div class="column"></div>');
                column.css('width', config.cellWidth);
                column.css('display', 'inline-block');
                for (var r = 0; r < 100; r++) {
                    var cell = $('<div class="cell"></div>');
                    // cell.html('x'+index+'y'+r + $scope.data[r][index]);
                    cell.html('x' + index + 'y' + r);
                    cell.css('width', config.cellWidth);
                    cell.css('height', config.cellHeight);
                    column.append(cell);
                }
                return column;
            }

            function createHeaderCell(index) {
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
                headCell.html('Header' + index);
                headCell.css('width', config.cellWidth);
                headCell.css('height', config.headerHeight);
                return headCell;
            }

            function createTable() {
                var body = $('.body');
                $('.body').scroll(function (e) {
                    var scrollLeft = body.scrollLeft();
                    $('.headCell').eq(0).css('margin-left', -scrollLeft);

                    var scrollTop = body.scrollTop();
                    pinnedColumns.forEach(function (column) {
                        column.css('margin-top', -scrollTop);
                    });
                });

                var y = 0;
                var x = 0;
                var draggedColumnIndex = void 0;

                $('.header').css('height', config.headerHeight);

                for (var h = 0; h < 30; h++) {
                    if (!$scope.columns[h].visible) continue;
                    var headCell = createHeaderCell(h);
                    $('.header').append(headCell);
                    x += config.cellWidth;
                }

                $scope.columns.forEach(function (column, index) {
                    if (!column.visible) return;
                    var column = createColumn(index);
                    body.append(column);
                });
            }

            createTable();

            var pinLeftToggler = false;
            var pinnedColumns = [];

            function pinLeft(index) {
                $('.header').css('margin-left', config.cellWidth);
                $('.body').css('margin-left', config.cellWidth);
                var width = $('.body').css('width').replace('px', '');
                $('.header').css('width', width - config.cellWidth);
                $('.body').css('width', width - config.cellWidth);

                var column = $('.column').eq(index).detach();
                column.css('position', 'absolute');
                column.css('top', config.headerHeight);
                column.css('left', 0);
                column.css('overflow', 'hidden');
                $('.table').append(column);
                pinnedColumns.push(column);
            };

            function unpinLeft(index) {
                $('.header').css('margin-left', '');
                $('.body').css('margin-left', '');
                $('.header').css('width', '');
                $('.body').css('width', '');

                var column = pinnedColumns.pop();
                column.detach();
                $('.column').eq(index + 1).before(column);
                column.css('position', '');
                column.css('top', '');
                column.css('left', '');
                column.css('overflow', '');
            }

            $scope.pinLeft = function (index) {
                if (!pinLeftToggler) pinLeft(index);
                else unpinLeft(index);
                pinLeftToggler = !pinLeftToggler;
            };

            function showColumn(index) {
                var column = createColumn(index);
                var cellHeader = createHeaderCell(index);
                $($('.column')[index]).before(column);
                $($('.headCell')[index]).before(cellHeader);
            }

            function hideColumn(index) {
                $($('.column')[index]).remove();
                $($('.headCell')[index]).remove();
            }

            $scope.toggleV = function () {
                if (!$scope.columns[1].visible) {
                    showColumn(1);
                } else {
                    hideColumn(1);
                }
                $scope.columns[1].visible = !$scope.columns[1].visible;
            };
        }
    };
}]);


myapp.controller('ctrl', function ($scope) {
    console.log('starting...');
});