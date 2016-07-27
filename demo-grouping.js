var app = angular.module('app', ['angularSmallGrid']);

app.controller('ctrl', function ($scope, $timeout) {
    $scope.columnFields = void 0;

    $scope.columnCount = 100;
    $scope.rowCount = 300;

    function createConfig() {
        var config = {
            localStorageKey: 'angular-small-grid-grouping',

            // special part for grouping
            disableColumnResize: true,
            disableColumnDrag: true,
            // end of special part

            cellHeight: 30,
            headerHeight: 60,

            cellTemplate: function (column, value) {
                if (column.field === 'selector') return '';
                return 'DATA' + value;
            },

            onCellClick: function (column, row, e) {
                console.log('clicked:');
                console.log(column);
                console.log(row);
                console.log(e);
            },

            columns: []
        };

        for (var i = 0; i < $scope.columnCount; i++) {
            config.columns.push({
                field: 'column' + i,
                name: 'Column ' + i,
                visible: true,
                width: 100,
                headerTemplate: '<div>Column' + i + '</div><div style="padding-left: 5px; padding-right: 5px;"><input type="text" style="width: 100%;"></div>'
            });
        }

        return config;
    }

    $scope.config = createConfig();

    function createData() {
        $scope.data = [];
        for (var r = 0; r < $scope.rowCount; r++) {
            var row = {};
            for (var p = 0; p < $scope.columnCount; p++) row['column' + p] = 'x' + p + 'y' + r;
            $scope.data.push(row);
        }
    }

    createData();

    $scope.reload = function () {
        $scope.data = void 0;
        $timeout(function () {
            createData();
        }, 2000);
    };

    $scope.noData = function () {
        $scope.data = [];
    };

});