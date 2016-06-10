myapp.controller('ctrl', function ($scope) {
    $scope.smallGridConfig = {
        cellHeight: 30,
        headerHeight: 30,

        cellTemplate: function (column, value) {
            if (column.field === 'selector') return '';
            return 'DATA' + value;
        },
        
        columns: []
    };

    $scope.smallGridConfig.columns.push({
        field: 'selector',
        visible: true,
        width: 20,
        pinned: 'left',
        headerTemplate: '<span>D</span>'
    });

    for (var i = 0; i < 30; i++) {
        $scope.smallGridConfig.columns.push({
            field: 'column' + i,
            name: 'Column ' + i,
            visible: true,
            width: 100
        });
    }
    
    $scope.pp = 12;
    $scope.smallGridConfig.columns[1].headerTemplate = '<span>OPA{{::pp}}</span>';

    $scope.smallGridData = [];
    for (var r = 0; r < 100; r++) {
        var row = {};
        for (var p = 0; p < 30; p++) row['column' + p] = 'x' + p + 'y' + r;
        $scope.smallGridData.push(row);
    }

    var pinLeftToggler = false;
    $scope.pinLeft = function (field) {
        if (!pinLeftToggler) $scope.smallGridPinLeft(field);
        else $scope.smallGridUnpinLeft(field);
        pinLeftToggler = !pinLeftToggler;
    };

    $scope.toggleV = function () {
        if (!$scope.smallGridFindColumn('column1').visible) {
            $scope.smallGridShowColumn('column1');
        } else {
            $scope.smallGridHideColumn('column1');
        }
    };
});