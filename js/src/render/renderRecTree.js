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
            .attr('width', recTree.rootSpTree.sizeX + 500)
            .attr('height', recTree.rootSpTree.sizeY + 500)
            .append('g')
            .attr('transform', function (d) {
              return 'translate(' + 50 + ',' + 50 + ')';
            });

  _drawSpTree(recTree.rootSpTree, svg);
  _drawGenesTrees(recTree.rootsRecGnTrees, svg);
};

function _drawSpTree (rootSpTree, svg) {

  svg = svg.append('g')
  .attr('class', 'spTree')
  .style('fill', 'none')
  .style('stroke', 'black')

  var nodes = svg.selectAll('.node')
    .data(rootSpTree.descendants())
    .enter()
    .append('g')
    .attr('transform', function (d) {
      console.log(d);
      return 'translate(' + d.data.speciesTopStartX + ',' + (d.data.speciesTopStartY - 5) + ')';
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
  .attr('d', _diagonalLinkLeft);

  svg.selectAll('.rightLinks')
  .data(rightLinks)
  .enter()
  .append('path')
  .attr('class', 'rightLinks')
  .attr('d', _diagonalLinkRight);

  var leaves = rootSpTree.leaves();
  svg.selectAll('.leaves')
  .data(leaves)
  .enter()
  .append('path')
  .attr('class', 'leaves')
  .attr('d', _leavesContainer);
}

function _diagonalLinkLeft (d) {
  var path = d3.path();
  var elbowPositionX;
  var elbowPositionY = d.source.container.stop.up.y;
  var isSpOut = d.target.data.sourceSpecies;


  if(!isSpOut){
    elbowPositionX = d.source.container.stop.down.x;
  }else {
    elbowPositionX = d.target.container.start.up.x - d.target.speciesHeight;
  }


  path.moveTo(d.source.container.start.up.x, elbowPositionY);
  path.lineTo(elbowPositionX, elbowPositionY);
  path.lineTo(elbowPositionX, d.target.container.start.up.y);
  path.lineTo(d.target.container.start.up.x, d.target.container.start.up.y);

  if (!isSpOut) {
    path.moveTo(d.target.x, d.source.y);
  } else {
    path.moveTo(d.target.x, d.source.container.start.up.y);
  }
  path.lineTo(d.target.container.start.down.x, d.target.container.start.down.y);

  return path.toString();
}

function _diagonalLinkRight (d) {
  var path = d3.path();
  var elbowPositionX = d.source.container.stop.down.x ;
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
  var bold = false;

  svg = svg.append('g')
  .attr('class', 'gnTree'+idTree)
  .style('stroke-width',2)
  .style('cursor','pointer')
  .on("click", function(d, i) {
    toggleStrokWidth(this, bold)
    bold = !bold;
  });


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

 var allNodes = rootRecGnTree.descendants();

 // var allNodes = svg.selectAll('.node')
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
  .attr('d', computeLeafGn);


  var losses = allLeaves.filter(function (l) {
    return l.data.eventsRec[0].eventType === 'loss' && !l.data.deadOutGn;
  });

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
  .style('stroke', colores_google(idTree))
  .attr('d', computeLossGn);

  var duplications = allNodes.filter(n => n.data.eventsRec[0].eventType === 'duplication' || n.data.eventsRec[0].eventType === 'bifurcationOut'  );

  svg.selectAll('.duplication'+idTree)
  .data(duplications)
  .enter()
  .append('g')
  .attr('transform', function (n) {
      return 'translate(' + n.x + ',' + n.y + ')';
    })
  .append('path')
  .attr('class', 'duplication'+idTree)
  .attr('d', computeDupGn)
  .style('fill', 'white')
  .style('stroke', colores_google(idTree));

  var transferBack = allNodes.filter(n => n.data.eventsRec[0].eventType === 'transferBack');

  svg.selectAll('.transferBack'+idTree)
  .data(transferBack)
  .enter()
  .append('g')
  .attr('transform', function (n) {
      return 'translate(' + n.x + ',' + n.y + ')';
    })
  .append('path')
  .attr('class', 'transferBack'+idTree)
  .attr('d', computeTrBackGn)
  .style('fill', 'white')
  .style('stroke', colores_google(idTree));

  var transferBackTarget = allNodes.filter(function (n) {
    return n.parent && n.parent.data.eventsRec[0].eventType === 'transferBack'&& n.data.eventsRec[0].eventType !== 'loss';
  });

  svg.selectAll('.transferBackTarget'+idTree)
  .data(transferBackTarget)
  .enter()
  .append('g')
  .attr('transform', function (n) {
      return 'translate(' + n.x + ',' + n.y + ')' + 'rotate(90)';
    })
  .append('path')
  .attr('class', 'transferBackTarget'+idTree)
  .attr('d', computeTransferBackTarget)
  .style('fill', 'white')
  .style('stroke', colores_google(idTree));


  svg.selectAll('.root'+idTree)
  .data([rootRecGnTree])
  .enter()
  .append('g')
  .attr('transform', function (n) {
      return 'translate(' + n.x + ',' + n.y + ')' + 'rotate(90)';
    })
  .append('path')
  .attr('class', 'root'+idTree)
  .attr('d', computeRootGn)
  .style('fill', 'white')
  .style('stroke', colores_google(idTree));

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

  return curvedVertical(source.x, source.y,target.x , target.y);
}


function computeLeafGn(n) {
  var path = d3.path();

  path.moveTo(n.x, n.y);
  path.lineTo(n.data.species.speciesEndX, n.y);
  return path.toString();
}

function computeLossGn(n) {
  var path = d3.symbol().size(256).type(d3.symbolCross);
  return path(n);
}

function computeDupGn(n) {
  var path = d3.symbol().size(256).type(d3.symbolSquare);
  return path(n);
}

function computeTrBackGn(n) {
  var path = d3.symbol().size(128).type(d3.symbolDiamond);
  return path(n);
}

function computeRootGn(n) {
  var path = d3.symbol().size(256).type(d3.symbolStar);
  return path(n);
}

function computeTransferBackTarget(n) {
  var path = d3.symbol().size(128).type(d3.symbolTriangle);
  return path(n);
}


function computeSpOutLinks(l) {
  var path = d3.path();
  var source = l.source;
  var target = l.target;
  var idCorridorSrc = source.data.idCorridor;
  var idCorridorTrg = target.data.idCorridor;
  var speciesTopStartX = target.data.species.speciesTopStartX;


  if(!target.data.deadOutGn){
    path.moveTo(source.x, source.y);

    if(target.data.out){
      path.lineTo(speciesTopStartX - (idCorridorTrg * historySize), source.y);
      path.lineTo(speciesTopStartX - (idCorridorTrg * historySize), target.y);
      path.lineTo(target.x , target.y);
    }else {
      path.lineTo(target.x , target.y);
    }
  }

  return path;
}

// Source https://github.com/hughsk/svg-line-curved
function curvedVertical(x1, y1, x2, y2) {
  var line = []
  var mx = x1 + (x2 - x1) / 2
  var my = y1 + (y2 - y1) / 2

  line.push('M', x1, y1)
  line.push('C', x1, my, x2, my, x2, y2)

  return line.join(' ')
}

function toggleStrokWidth(gnTreeSvg,bold) {
  if(!bold){
    d3.select(gnTreeSvg)
    .style('stroke-width',5)
    .style('font-weight','bold');
  }else {
    d3.select(gnTreeSvg)
    .style('stroke-width',2)
    .style('font-weight','normal');
  }
}
