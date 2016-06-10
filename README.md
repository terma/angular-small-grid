# angular-small-grid

Licensed MIT

[Demo](http://terma.github.io/angular-small-grid/demo.html)

## How To Install

```bash
npm i angular-small-grid
```


## How to Use 

Include ```angular-small-grid.js``` and ```angular-small-grid.css``` to your page

### Set Grid Config

```js
$scope.config = {
  cellHeight: 30,
  headerHeight: 30,
  
  // optional if not specify show value from data object
  cellTemplate: function (column, value) { return value; }, 
  
  // optional if not specified just Loading...
  loaderTemplate: '<div>L...</div>',

  columns: [{
    name: 'Visible Name',
    field: 'fieldNameInDataObject',
    width: 122,
    visible: true,
    pinned: void 0 // could be 'left'
  }]
};
```

### Set Data

```js
$scope.data = [{field1: 12}];
```

```js
<small-grid sg-config="smallGridConfig" sg-data="smallGridData"></small-grid>
```
