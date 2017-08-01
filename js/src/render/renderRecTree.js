/**
 * @Author: Guillaume GENCE <guigen>
 * @Date:   2017-07-05T14:11:53+02:00
 * @Email:  guillaume.gence@univ-lyon1.fr
 * @Last modified by:   guigen
 * @Last modified time: 2017-07-05T16:27:39+02:00
 */

recTreeVisu.render = function (recTree, domContainerId) {
  var svg = d3.select(domContainerId)
            .append('svg')
            .attr('width', 2000)
            .attr('height', 2000)
            .append('g')
            .attr('transform', function (d) {
              return 'translate(' + 100 + ',' + 0 + ')';
            });



  _drawSpTree(recTree.rootSpTree, svg);
  _drawGenesTrees(recTree.rootsRecGnTrees, svg);
};

function _drawSpTree (rootSpTree, svg) {

  var nodes = svg.selectAll('.node')
    .data(rootSpTree.descendants())
    .enter()
    .append('g')
    .attr('transform', function (d) {
      return 'translate(' + d.x + ',' + d.y + ')';
    });

  // nodes.append('text')
  //      .text(function (d) {
  //        var name = d.data.name;
  //        if (d.data.sameAsParent) {
  //          name = d.parent.data.name;
  //        }
  //        return name;
  //      });

  var links = rootSpTree.links();

  var leftLinks = links.filter(function (d) {
    return d.target.posChild === 0;
  });

  var rightLinks = links.filter(function (d) {
    return d.target.posChild === 1;
  });

  for (var descendant of rootSpTree.descendants()) {
    descendant.color = randomColor({luminosity: 'dark'});
  }

  svg.selectAll('.leftLinks')
  .data(leftLinks)
  .enter()
  .append('path')
  .attr('class', 'leftLinks')
  .style('fill', 'none')
  .style('stroke', 'grey')
  .attr('d', _diagonalLinkLeft);

  svg.selectAll('.rightLinks')
  .data(rightLinks)
  .enter()
  .append('path')
  .attr('class', 'rightLinks')
  .style('fill', 'none')
  .style('stroke', 'grey')
  .attr('d', _diagonalLinkRight);

  var leaves = rootSpTree.leaves();
  svg.selectAll('.leaves')
  .data(leaves)
  .enter()
  .append('path')
  .attr('class', 'leaves')
  .style('fill', 'none')
  .style('stroke', 'grey')
  .attr('d', _leavesContainer);
}

function _diagonalLinkLeft (d) {
  var path = d3.path();
  var elbowPositionX = d.source.container.stop.up.x;
  var elbowPositionY = d.source.container.stop.up.y;

  path.moveTo(d.source.container.start.up.x, elbowPositionY);
  path.lineTo(elbowPositionX, elbowPositionY);
  path.lineTo(elbowPositionX, d.target.container.start.up.y);
  path.lineTo(d.target.container.start.up.x, d.target.container.start.up.y);

  if (!d.target.data.sourceSpecies) {
    path.moveTo(d.target.x, d.source.y);
  } else {
    path.moveTo(d.target.x, d.source.container.start.up.y);
  }
  path.lineTo(d.target.container.start.down.x, d.target.container.start.down.y);

  return path.toString();
}

function _diagonalLinkRight (d) {
  var path = d3.path();
  var elbowPositionX = d.source.container.stop.down.x;
  var elbowPositionY = d.source.container.stop.down.y;

  path.moveTo(d.source.container.start.down.x, elbowPositionY);
  path.lineTo(elbowPositionX, elbowPositionY);
  path.lineTo(elbowPositionX, d.target.container.start.down.y);
  path.lineTo(d.target.container.start.down.x, d.target.container.start.down.y);

  if (!d.target.data.sameAsParent) {
    path.moveTo(d.target.x, d.source.y);
    path.lineTo(d.target.container.start.up.x, d.target.container.start.up.y);
  }

  return path.toString();
}

function _leavesContainer (d) {
  var path = d3.path();
  path.moveTo(d.container.start.up.x, d.container.start.up.y);
  path.lineTo(d.container.x, d.container.stop.up.y);
  path.lineTo(d.container.x, d.container.stop.down.y);
  path.lineTo(d.container.start.down.x, d.container.start.down.y);

  d.data.speciesEndX = d.container.x;
  d.data.speciesEndY = d.container.y;

  return path.toString();
}



function _drawGenesTrees (rootsRecGnTrees, svg) {
  rootsRecGnTrees.forEach(rootRecGnTree => _drawGenesTree(rootRecGnTree, svg) );
}

function _drawGenesTree (rootRecGnTree, svg) {

  // var nodes = svg.selectAll('.node')
  //   .data(rootRecGnTree.descendants())
  //   .enter()
  //   .append('g')
  //   .attr('transform', function (d) {
  //     return 'translate(' + d.x + ',' + d.y + ')';
  //   });
  //
  //   nodes.append('text')
  //        .text(function (d) {
  //          var name = d.data.name;
  //          return name;
  //        });

 // var nodes = svg.selectAll('.node')
 //   .data(rootRecGnTree.descendants())
 //   .enter()
 //    .append('circle')
 //    .attr('cx', d => d.x)
 //    .attr('cy', d => d.y)
 //    .attr('r', 3);

  var links = rootRecGnTree.links();

  svg.selectAll('.gnLinks')
  .data(links)
  .enter()
  .append('path')
  .attr('class', 'gnLinks')
  .style('fill', 'none')
  .style('stroke', 'black')
  .attr('d', computeGnLinks);

  var allLeaves = rootRecGnTree.leaves();

  var leaves = allLeaves.filter(l => l.data.eventsRec[0].eventType === 'leaf');

  svg.selectAll('.gnLeaves')
  .data(leaves)
  .enter()
  .append('path')
  .attr('class', 'gnLeaves')
  .style('fill', 'none')
  .style('stroke', 'black')
  .attr('d', computeLeafGn);

  var losses = allLeaves.filter(l => l.data.eventsRec[0].eventType === 'loss');

  svg.selectAll('.gnLosses')
  .data(losses)
  .enter()
  .append('g')
  .attr('transform', function (l) {
      return 'translate(' + l.x + ',' + l.y + ')' + 'rotate(45)';
    })
  .append('path')
  .attr('d', computeLossGn);
}


function computeGnLinks (l) {

  var sourceEventType = l.source.data.eventsRec[0].eventType;
  var linkPath;

  switch (sourceEventType) {
    case 'speciation':
    case 'speciationLoss':
    case 'speciationOut':
    case 'speciationOutLoss':
    case 'duplication':
    case 'bifurcationOut':
      linkPath = computeSpeciationLinks(l);
      break;
    case 'transferBack':
      linkPath = computeTrBackLinks(l);
      break;
    default:

  }
  return linkPath;
}

// FIXME le positionnement ne doit pas etre croisé
function computeSpeciationLinks(l) {
  var source = l.source;
  var target = l.target;
  var path = d3.path();
  var idCorridor = source.data.idCorridor

  path.moveTo(source.x, source.y);
  path.lineTo(target.x - (idCorridor * historySize), source.y)
  path.lineTo(target.x - (idCorridor * historySize), target.y)
  path.lineTo(target.x , target.y)

  return path.toString();
}


function computeTrBackLinks(l) {
  var source = l.source;
  var target = l.target;
  var path = d3.path();

  path.moveTo(source.x, source.y);
  path.lineTo(target.x , target.y)

  return path.toString();
}


function computeLeafGn(n) {
  var path = d3.path();

  path.moveTo(n.x, n.y);
  path.lineTo(n.data.species.speciesEndX, n.y);
  return path.toString();
}

function computeLossGn(n) {
  var path = d3.symbol().size(64).type(d3.symbolCross)(n)
  return path;
}
