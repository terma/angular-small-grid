var app = angular.module('app', ['angularSmallGrid']);

app.controller('ctrl', function ($scope, $timeout) {
    $scope.columnFields = void 0;

    function createConfig() {
        var config = {
            localStorageKey: 'my-grid-settings',

            cellHeight: 30,
            headerHeight: 30,

            cellTemplate: function (column, value) {
                if (column.field === 'selector') return '';
                return 'DATA' + value;
            },

            onOrderChange: function () {
                $scope.columnFields = '';
                $scope.config.columns.forEach(function (column) {
                    if ($scope.columnFields.length < 50)
                        $scope.columnFields += ' ' + column.field;
                });
            },

            columns: [{
                field: 'selector',
                visible: true,
                width: 20,
                pinned: 'left',
                headerTemplate: '<span>*</span>'
            }]
        };

        // more columns
        config.columns.push({field: 'column0', name: 'IE', visible: true, width: 100});
        config.columns.push({field: 'column1', name: 'Firefox', visible: true, width: 100});
        config.columns.push({field: 'column2', name: 'Chrome', visible: true, width: 100});
        config.columns.push({field: 'column3', name: 'Opera', visible: true, width: 100});
        config.columns.push({field: 'column4', name: 'Safari', visible: true, width: 100});
        for (var i = 5; i < 30; i++) {
            config.columns.push({
                field: 'column' + i,
                name: 'Column ' + i,
                visible: true,
                width: 100
            });
        }

        config.columns[1].headerTemplate = '<span>Field {{::pp}}</span>';

        return config;
    }

    $scope.config = createConfig();

    $scope.pp = 12;

    function createData() {
        $scope.data = [];
        for (var r = 0; r < 100; r++) {
            var row = {};
            for (var p = 0; p < 30; p++) row['column' + p] = 'x' + p + 'y' + r;
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

    var pinLeftToggler = false;
    $scope.pinLeft = function (field) {
        if (!pinLeftToggler) $scope.angularSmallGridPinLeft(field);
        else $scope.angularSmallGridUnpinLeft(field);
        pinLeftToggler = !pinLeftToggler;
    };

    $scope.updateConfig = function () {
        $scope.config = createConfig();
    };

    $scope.noData = function () {
        $scope.data = [];
    };

    $scope.toggleV = function () {
        if (!$scope.angularSmallGridFindColumn('column1').visible) {
            $scope.angularSmallGridShowColumn('column1');
        } else {
            $scope.angularSmallGridHideColumn('column1');
        }
    };
});