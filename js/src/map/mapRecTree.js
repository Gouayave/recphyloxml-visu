/**
 * @Author: Guillaume GENCE <guigen>
 * @Date:   2017-07-05T14:11:50+02:00
 * @Email:  guillaume.gence@univ-lyon1.fr
 * @Last modified by:   guigen
 * @Last modified time: 2017-07-05T16:17:56+02:00
 */

// FIXME Ne pas mettre en variable globales
 var defaultSize = { width: 300, height: 500 };
 var eventSize = 30;
 var historySize = 25;


recTreeVisu.map = function (rootsClades) {
  var spTreeLayout = _spTreeLayout();
  var recGnTreesLayout = _recGnTreesLayout();
  var recTree;

  recTree = recTreeVisu._computeHierarchy(rootsClades);
  spTreeLayout(recTree.rootSpTree);
  recGnTreesLayout(recTree.rootsRecGnTrees);
  return recTree;
};


function _spTreeLayout () {
  // FIXME Calcul des coordonnées
  // Les coordonnées du container doivent etre calculer en fonction du nb d'evenement et du nb d'histoires de gênes.


  function spTreeLayout (root) {
    var size = defaultSize;
    var maxDepth,
      numberOfNodes;
    var y = 0;
    var leaves;

    root.constructor.prototype.inOrderTraversal = _inOrderTraversal;
    root.constructor.prototype.getMaxDepthX = function () {
      return size.width;
    };

    numberOfNodes = root.descendants().length;

    // Placement en y
    root.inOrderTraversal(function (d) {
      var speciesHeight,
          nbCorridors = d.data.nbCorridors || 1;

      speciesHeight = historySize + nbCorridors * historySize;
      d.speciesHeight = speciesHeight;

      y += speciesHeight /2;
      d.y = y;
      y += speciesHeight /2;

      // Placement différent pour un enfant out
      if (d.data.sameAsParent) {
        d.parent.y = d.y;
        // FIXME ce n'est pas la bonne façon de faire ...
        // Il vaut mieux prévenir le nouveaux fils d'un corridors
        if(d.parent.speciesHeight > d.speciesHeight){
          d.speciesHeight = d.parent.speciesHeight;
        }
      }
    });

    // Placement en x
    root.x = 50;
    maxDepth = 0;
    root.each(function (d) {
      var nbGnEvents = d.data.nbGnEvents || 0;
          speciesWidth = eventSize + nbGnEvents * eventSize;

      d.speciesWidth = speciesWidth;

      if (d.parent) {
        d.x = d.parent.x + d.parent.speciesWidth + d.parent.speciesHeight;
      }

      if (d.x > maxDepth) {
        maxDepth = d.x;
      }
    });

    // Compute container position
    root.each(function (d) {
      speciesHeight = d.speciesHeight;

      d.container = {
        start: { up: {}, down: {} },
        stop: { up: {}, down: {} }
      };

      d.container.start.up.x = d.x;
      d.container.start.up.y = d.y - (speciesHeight / 2);

      d.container.start.down.x = d.x;
      d.container.start.down.y = d.y + (speciesHeight / 2);

      d.container.stop.up.x = d.x + d.speciesWidth;
      d.container.stop.up.y = d.container.start.up.y;

      d.container.stop.down.x = d.container.stop.up.x;
      d.container.stop.down.y = d.container.start.down.y;

      // FIXME Beaucoup de repetition
      // Pemet de donner un point de départ au arbres de gènes fils
      d.data.speciesTopStartX = d.container.start.up.x;
      d.data.speciesTopStartY = d.container.start.up.y;
      d.data.speciesTopStopX = d.container.stop.up.x;
      d.data.speciesBottomY = d.container.start.down.y;


    });

    leaves = root.leaves()
    leaves.forEach(function (d) {

      if(!d.data.out){
        d.container.x = maxDepth + (2 * eventSize);
      }else {
        d.container.x = d.data.speciesTopStopX + eventSize;
      }


      d.container.y = d.y;
      d.data.maxX = d.container.x;
    });

    // Taille de l'arbre;
    root.sizeX = maxDepth;
    root.sizeY = y;

  }
  return spTreeLayout;
}

function _recGnTreesLayout () {
  function recGnTreesLayout (roots) {
    return roots.map(root => recGnTreeLayout(root));
  }
  function recGnTreeLayout(root) {
    var nodes;
    nodes = root.descendants();
    nodes.forEach(function (node) {
      // On place les x
      var speciesTopStartX = node.data.species.speciesTopStartX;
      var idEvent = node.data.idEvent;
      node.x = speciesTopStartX + (idEvent * eventSize);

      // On place le y
      var speciesTopStartY = node.data.species.speciesTopStartY;
      var speciesBottomY = node.data.species.speciesBottomY;
      var idCorridor = node.data.idCorridor;
      var posChildSpecies = node.data.species.posChild;


      if(posChildSpecies === 1){
        node.y = speciesTopStartY + (idCorridor * historySize );
        if(node.data.species.sameAsParent && node.data.species.posParent === 0){
          node.y = speciesBottomY - (idCorridor * historySize );
        }
      }else {
        node.y = speciesBottomY - (idCorridor * historySize );
      }

    });

    return root;
  }

  return recGnTreesLayout;
}

function _inOrderTraversal (callback) {
  var node = this;
  var children = node.children;

  if (children && children[0]) {
    children[0].inOrderTraversal(callback);
  }

  callback(node);

  if (children && children[1]) {
    children[1].inOrderTraversal(callback);
  }

  return this;
}
