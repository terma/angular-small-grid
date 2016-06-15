# angular-small-grid

Simple and naive implementation of grid for Angular. Tested: IE 11 and Chrome 50

## Features

* Configurable columns and data
* Reordable columns
* Resizable columns
* Pinnable columns
* Loading message
* No Data message
* Store restore state of grid to ```localStorage```

[Demo](http://terma.github.io/angular-small-grid/demo.html)

## License

MIT

## How To Install

```bash
npm i angular-small-grid
```

## How to Use 

### Include resources

```html
<script type="application/javascript" src="angular-small-grid.js"></script>
<link rel="stylesheet" href="angular-small-grid.css">
```

### Add Grid on Page

```js
<angular-small-grid sg-config="smallGridConfig" sg-data="smallGridData"></angular-small-grid>
```

### Set Grid Config

```js
$scope.config = {
  cellHeight: 30,
  headerHeight: 30,

  // optional if you want to store state of your grid in localStorage
  // width, position, pinned state, visibility will be stored
  localStorageKey: 'my-settings',
  
  // optional if not specify show value from data object
  cellTemplate: function (column, value) { return value; }, 
  
  // optional if not specified just Loading... (doesn't support Angular markup)
  loaderTemplate: '<div>L...</div>',

  // optional if not specified just No Data (doesn't support Angular markup)
  noDataTemplate: '<span>No Data</span>',

  // optional, raised when columns order was changed
  onOrderChange: function () {},

  // optional, raised when cell clicked by mouse
  onCellClick: function (column, row, event) {},

  columns: [{
    name: 'Visible Name',
    field: 'fieldNameInDataObject',
    width: 122,
    visible: true,

    minWidth: 222, // optional param by default 50px

    pinned: void 0, // optional, could be 'left'

    fixedWidth: true, // optional to disable column resizing

    // header template executes in dedicated (parent is your scope) scope with injected column

    // optional, support Angular
    headerTemplate: '<span>{{ ::countOfColumns }}</span>',

    // optional, uses Angular $templateCache, has priority on headerTemplate
    headerTemplateUrl: 'url'
  }]
};
```

### Set Data

```js
$scope.data = [{field1: 12}];
```

### API

A few useful functions related to grid will be injected in your scope

```js

    // Pin column to left border of grid
    // Call for pinned column does nothing
    // field is column.field
    // result void 0
    $scope.angularSmallGridPinLeft(field);

    // Unpin column by column.field
    // For unpinned does nothing
    // result void 0
    $scope.angularSmallGridUnpinLeft(field);

    // Return column from config by column.field
    // or void 0
    $scope.angularSmallGridFindColumn(field);

    // Show column on grid by column.field if hidden
    // otherwise do nothing
    $scope.angularSmallGridShowColumn(field);

    // Hide column on grid by column.field if hidden
    // otherwise do nothing
    $scope.angularSmallGridHideColumn(field);
```