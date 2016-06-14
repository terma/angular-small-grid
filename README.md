# angular-small-grid

Simple and naive implementation of grid for Angular under MIT license

## Features

* Configurable columns and data
* Reordable columns
* Resizable columns
* Pinnable columns
* Loading message
* No Data message
* Store restore state of grid to ```localStorage```

[Demo](http://terma.github.io/angular-small-grid/demo.html)

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
    pinned: void 0, // could be 'left'
    
    // optional, support Angular
    headerTemplate: '<span>{{ ::countOfColumns }}</span>'
  }]
};
```

### Set Data

```js
$scope.data = [{field1: 12}];
```

### Add Grid to Page

```js
<small-grid sg-config="smallGridConfig" sg-data="smallGridData"></small-grid>
```
