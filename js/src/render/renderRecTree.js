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
            .attr('width', 20000)
            .attr('height', 20000)
            .append('g')
            .attr('transform', function (d) {
              return 'translate(' + 50 + ',' + 50 + ')';
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
      return 'translate(' + d.x + ',' + (d.y - 40) + ')';
    });

  nodes.append('text')
       .text(function (d) {
         var name = d.data.name;

        //  if (d.data.sameAsParent) {
        //    name = d.parent.data.name;
        //  }
         return name;
       });

  var links = rootSpTree.links();

  var leftLinks = links.filter(function (d) {
    return d.target.data.posChild === 0;
  });

  var rightLinks = links.filter(function (d) {
    return d.target.data.posChild === 1;
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

function colores_google(n) {
  var colores_g = ["#109618", "#3366cc", "#dc3912", "#ff9900", "#990099", "#0099c6", "#dd4477", "#66aa00", "#b82e2e", "#316395", "#994499", "#22aa99", "#aaaa11", "#6633cc", "#e67300", "#8b0707", "#651067", "#329262", "#5574a6", "#3b3eac"];
  return colores_g[n % colores_g.length];
}


function _drawGenesTree (rootRecGnTree, svg) {
  var idTree = rootRecGnTree.data.idTree;


  svg.selectAll('.leaf'+idTree)
  .data(  rootRecGnTree.leaves().filter(function (l) {
      return l.data.eventsRec[0].eventType === 'leaf'
    }))
    .enter()
  .append('g')
  .attr('class', 'leaf'+idTree)
  .attr('transform', function (d) {
        var x = d.data.species.maxX || d.x;
        return 'translate(' + (x + 10) + ',' + d.y + ')';
  })
  .append('text')
  .style('fill', colores_google(idTree))
  .text(function (d) {
    var name = d.data.eventsRec[0].geneName || d.data.name;
    var location = d.data.eventsRec[0].speciesLocation;
    return name + ' ('+location+')';
   });

 // var nodes = svg.selectAll('.node')
 //   .data(rootRecGnTree.descendants())
 //   .enter()
 //    .append('circle')
 //    .attr('cx', d => d.x)
 //    .attr('cy', d => d.y)
 //    .attr('r', 3);

  var links = rootRecGnTree.links();

  svg.selectAll('.gnLinks'+idTree)
  .data(links)
  .enter()
  .append('path')
  .attr('class', 'gnLinks'+idTree)
  .style('fill', 'none')
  .style('stroke', colores_google(idTree))
  .style('stroke-width',2)
  .style('stroke-dasharray', function (l) {
    if(l.source.data.eventsRec[0].eventType === "transferBack" && l.target.data.eventsRec[0].eventType !== "loss"){
      return "5,5";
    }
  })
  .attr('d', computeGnLinks);

  var allLeaves = rootRecGnTree.leaves();

  var leaves = allLeaves.filter(l => l.data.eventsRec[0].eventType === 'leaf');

  svg.selectAll('.gnLeaves'+idTree)
  .data(leaves)
  .enter()
  .append('path')
  .attr('class', 'gnLeaves'+idTree)
  .style('fill', 'none')
  .style('stroke', colores_google(idTree))
  .attr('stroke-width',2)
  .attr('d', computeLeafGn);

  var losses = allLeaves.filter(l => l.data.eventsRec[0].eventType === 'loss');

  svg.selectAll('.gnLosses'+idTree)
  .data(losses)
  .enter()
  .append('g')
  .attr('class', 'gnLosses'+idTree)
  .attr('transform', function (l) {
      return 'translate(' + l.x + ',' + l.y + ')' + 'rotate(45)';
    })
  .append('path')
  .style('fill', 'white')
  .attr('stroke-width',2)
  .style('stroke', colores_google(idTree))
  .attr('d', computeLossGn);
}


function computeGnLinks (l) {

  var sourceEventType = l.source.data.eventsRec[0].eventType;
  var linkPath;

  switch (sourceEventType) {
    case 'speciation':
    case 'speciationLoss':
      linkPath = computeSpeciationLinks(l);
      break;
    case 'speciationOut':
    case 'speciationOutLoss':
      linkPath = computeSpOutLinks(l);
      break;
    case 'duplication':
    case 'bifurcationOut':
      linkPath = computeDuplicationGnLinks(l);
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
  var idCorridor = source.data.idCorridor;
  var speciesTopStartX = target.data.species.speciesTopStartX;


  path.moveTo(source.x, source.y);
  path.lineTo(speciesTopStartX - (idCorridor * historySize), source.y);
  path.lineTo(speciesTopStartX - (idCorridor * historySize), target.y);
  path.lineTo(target.x , target.y);

  return path.toString();
}

function computeDuplicationGnLinks(l) {

  var source = l.source;
  var target = l.target;
  var path = d3.path();

  path.moveTo(source.x, source.y);
  path.lineTo(target.x, target.y);
  return path.toString();
}


function computeTrBackLinks(l) {
  var source = l.source;
  var target = l.target;
  var path = d3.path();

  path.moveTo(source.x, source.y);
  path.lineTo(target.x , target.y);

  return path.toString();
}


function computeLeafGn(n) {
  var path = d3.path();

  path.moveTo(n.x, n.y);
  path.lineTo(n.data.species.speciesEndX, n.y);
  return path.toString();
}

function computeLossGn(n) {
  var path = d3.symbol().size(128).type(d3.symbolCross);
  return path(n);
}

function computeSpOutLinks(l) {
  var path = d3.path();
  var source = l.source;
  var target = l.target;
  var idCorridor = source.data.idCorridor;
  var speciesTopStartX = target.data.species.speciesTopStartX;

  path.moveTo(source.x, source.y);

  if(target.data.out){
    path.lineTo(speciesTopStartX - (idCorridor * historySize), source.y);
    path.lineTo(speciesTopStartX - (idCorridor * historySize), target.y);
    path.lineTo(target.x , target.y);
  }else {
    path.lineTo(target.x , target.y);
  }

  return path;
}
