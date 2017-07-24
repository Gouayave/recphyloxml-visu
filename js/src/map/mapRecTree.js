/**
 * @Author: Guillaume GENCE <guigen>
 * @Date:   2017-07-05T14:11:50+02:00
 * @Email:  guillaume.gence@univ-lyon1.fr
 * @Last modified by:   guigen
 * @Last modified time: 2017-07-05T16:17:56+02:00
 */

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
  var defaultSize = { width: 300, height: 500 };
  var eventSize = 50;
  var historySize = 20;

  function spTreeLayout (root) {
    var size = defaultSize;
    var maxDepth,
      separationHeight,
      numberOfNodes;
    var y = 0;
    var leaves;

    root.constructor.prototype.inOrderTraversal = _inOrderTraversal;
    root.constructor.prototype.getMaxDepthX = function () {
      return size.width;
    };

    numberOfNodes = root.descendants().length;
    separationHeight = size.height / numberOfNodes;
    root.inOrderTraversal(function (d) {
      // FIXME Position y de l'arbre des espèces
      // Refaire en fonction du nb d'histoire
      y += separationHeight;
      d.y = y;
      y += separationHeight;

      // FIXME Placement x différent si un des enfant est une espece morte
      if (d.data.sameAsParent) {
        var middleY = (d.y + d.parent.y) / 2;
        d.y = middleY;
        d.parent.y = middleY;
      }
    });

    // maxDepth = _maxDepth(root);
    // separationWidth = size.width / (maxDepth + 1);
    root.x = 50;
    maxDepth = 0;
    root.each(function (d) {
      // d.x = d.depth * separationWidth;
      if (d.parent) {
        d.x = d.parent.x + eventSize + (historySize * 2);
      }

      if (d.x > maxDepth) {
        maxDepth = d.x;
      }
    });

    // Compute container position
    root.each(function (d) {
      d.container = {
        start: { up: {}, down: {} },
        stop: { up: {}, down: {} }
      };

      d.container.start.up.x = d.x;
      d.container.start.up.y = d.y - historySize;

      d.container.start.down.x = d.x;
      d.container.start.down.y = d.y + historySize;

      d.container.stop.up.x = d.x + eventSize;
      d.container.stop.up.y = d.container.start.up.y;

      d.container.stop.down.x = d.container.stop.up.x;
      d.container.stop.down.y = d.container.start.down.y;
    });

    leaves = root.leaves();
    leaves.forEach(function (d) {
      // d.container.x = (maxDepth + 1) * separationWidth;
      d.container.x = maxDepth + eventSize + historySize;
      d.container.y = d.y;
    });
  }
  return spTreeLayout;
}

function _recGnTreesLayout () {
  function recGnTreesLayout (roots) {

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
