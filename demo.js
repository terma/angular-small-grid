myapp.controller('ctrl', function ($scope) {
    $scope.smallGridConfig = {
        cellWidth: 100,
        cellHeight: 30,
        headerHeight: 30,

        cellTemplate: function (value) {
            return 'DATA' + value;
        },
        
        columns: []
    };

    for (var i = 0; i < 30; i++) {
        $scope.smallGridConfig.columns.push({
            field: 'column' + i,
            name: 'Column ' + i,
            visible: true
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
});