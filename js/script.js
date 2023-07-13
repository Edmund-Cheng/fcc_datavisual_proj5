const DATASETS = {
  kickstarter: 
    'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/kickstarter-funding-data.json'
  ,
  movies: 
    'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/movie-data.json'
  ,
  videogames: 
    'https://cdn.freecodecamp.org/testable-projects-fcc/data/tree_map/video-game-sales-data.json'
};

var urlParams = new URLSearchParams(window.location.search);
const DEFAULT_DATASET = 'kickstarter';
const DATASET = DATASETS[urlParams.get('data') || DEFAULT_DATASET];

// Define the div for the tooltip
var tooltip = d3
  .select('body')
  .append('div')
  .attr('class', 'tooltip')
  .attr('id', 'tooltip')
  .style('opacity', 0);

// Width and Height of the SVG
var width = 1280,
    height= 800;

var svg = d3
  .select('#tree-map')
  .attr("width", width)
  .attr("height", height);

var legend = d3
  .select('#legend')
  .attr('width', width);

// d3.schemeCategory20() function was removed from D3.js in version 6.0.0
// d3.schemeCategory() function was removed from D3.js in version 7.0.0. There is no replacement for this function.
// So need to put 20 colors by hex in array
var color = d3.scaleOrdinal().range(
  [
    '#a6cee3',
    '#1f78b4',
    '#b2df8a',
    '#33a02c',
    '#fb9a99',
    '#e31a1c',
    '#fdbf6f',
    '#ff7f00',
    '#cab2d6',
    '#6a3d9a',
    '#8dd3c7',
    '#ffffb3',
    '#bebada',
    '#fb8072',
    '#80b1d3',
    '#fdb462',
    '#b3de69',
    '#fccde5',
    '#d9d9d9',
    '#bc80bd'
  ]
);

var treemap = d3.treemap().size([width, height]).paddingInner(1);

d3.json(DATASET)
  .then(data => {

    const titleElement = document.getElementById('title');
    titleElement.textContent = data.name;

    const descElement = document.getElementById('description');
    descElement.textContent = "Data from " + DATASET;

    var root = d3
      .hierarchy(data)
      .sum(d => d.hasOwnProperty("value") ? d.value : 0)
      .sort(function (a, b) {
        return b.height - a.height || b.value - a.value;
      });
    
    treemap(root);    

    var cell = svg
      .selectAll('g')
      .data(root.leaves())
      .enter()
      .append('g')
      .attr('class', 'group')
      .attr('transform', function (d) {
        return 'translate(' + d.x0 + ',' + d.y0 + ')';
      });

    cell
      .append('rect')
      .attr('class', 'tile')
      .attr('width', (d) => d.x1 - d.x0)
      .attr('height', (d) => d.y1 - d.y0)
      .attr('data-name', (d) => d.data.name)
      .attr('data-category', (d) => d.data.category)
      .attr('data-value', (d) => d.data.value)
      .attr('fill', (d) => color(d.data.category))
      .on('mousemove', function (event, d) {
        tooltip.style('opacity', 0.9);
        tooltip
          .html(
            'Name: ' +
            d.data.name +
            '<br>Category: ' +
            d.data.category +
            '<br>Value: ' +
            d.data.value
          )
          .attr('data-value', d.data.value)
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY - 28 + 'px');
      })
      .on('mouseout', function () {
        tooltip.style('opacity', 0);
      });
    
    cell
      .append('text')
      .attr('class', 'tile-text')
      .selectAll('tspan')
      .data(function (d) {
        return d.data.name.split(" ");
      })
      .enter()
      .append('tspan')
      .attr('x', 4)
      // The name is splited by space, to set them into new line, need to increase their y by their index
      .attr('y', function (d, i) {
        return 10 + i * 10;
      })
      .text(function (d) {
        return d;
      });
    
    // Creates an array of categories by looping through the leaf nodes of the tree
    // and getting the category property of each node. 
    var categories = root.leaves().map(function (nodes) {
      return nodes.data.category;
    });
    // The filter() method filters the array of categories to remove any duplicate categories. 
    categories = categories.filter(function (category, index, self) {
      return self.indexOf(category) === index;
    });
      
    const LEGEND_RECT_SIZE = 15;
    // The x-axis space required for the legend, including the rect size & text size
    const LEGEND_X_SPACING = 150;
    // The y-axis space between each row
    const LEGEND_Y_SPACING = 1;
    const LEGEND_TEXT_X_OFFSET = 3;
    const LEGEND_TEXT_Y_OFFSET = -2;

    var legendWidth = width;
    var legendElemsPerRow = Math.floor(legendWidth / LEGEND_X_SPACING);
    
    var legendElem = legend
      .append('g')
      .attr('transform', 'translate(60, 10)')
      .selectAll('g')
      .data(categories)
      .enter()
      .append('g')
      .attr('transform', function (d, i) {
        return (
          'translate(' +
          (i % legendElemsPerRow) * LEGEND_X_SPACING +
          ',' +
          (Math.floor(i / legendElemsPerRow) * LEGEND_RECT_SIZE +
            LEGEND_Y_SPACING * Math.floor(i / legendElemsPerRow)) +
          ')'
        );
      });

    legendElem
      .append('rect')
      .attr('width', LEGEND_RECT_SIZE)
      .attr('height', LEGEND_RECT_SIZE)
      .attr('class', 'legend-item')
      .attr('fill', function (d) {
        return color(d);
      });

    legendElem
      .append('text')
      .attr('x', LEGEND_RECT_SIZE + LEGEND_TEXT_X_OFFSET)
      .attr('y', LEGEND_RECT_SIZE + LEGEND_TEXT_Y_OFFSET)
      .text(function (d) {
        return d;
      });
  })
  .catch(err => console.log(err));