myapp.controller('ctrl', function ($scope) {
    $scope.config = {
        cellHeight: 30,
        headerHeight: 30,

        cellTemplate: function (column, value) {
            if (column.field === 'selector') return '';
            return 'DATA' + value;
        },

        columns: []
    };

    $scope.config.columns.push({
        field: 'selector',
        visible: true,
        width: 20,
        pinned: 'left',
        headerTemplate: '<span>D</span>'
    });

    for (var i = 0; i < 30; i++) {
        $scope.config.columns.push({
            field: 'column' + i,
            name: 'Column ' + i,
            visible: true,
            width: 100
        });
    }

    $scope.pp = 12;
    $scope.config.columns[1].headerTemplate = '<span>OPA{{::pp}}</span>';

    $scope.data = [];
    for (var r = 0; r < 100; r++) {
        var row = {};
        for (var p = 0; p < 30; p++) row['column' + p] = 'x' + p + 'y' + r;
        $scope.data.push(row);
    }

    var pinLeftToggler = false;
    $scope.pinLeft = function (field) {
        if (!pinLeftToggler) $scope.angularSmallGridPinLeft(field);
        else $scope.angularSmallGridUnpinLeft(field);
        pinLeftToggler = !pinLeftToggler;
    };

    $scope.toggleV = function () {
        if (!$scope.angularSmallGridFindColumn('column1').visible) {
            $scope.angularSmallGridShowColumn('column1');
        } else {
            $scope.angularSmallGridHideColumn('column1');
        }
    };
});