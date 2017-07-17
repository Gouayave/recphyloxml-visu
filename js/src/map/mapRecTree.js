/**
 * @Author: Guillaume GENCE <guigen>
 * @Date:   2017-07-05T14:11:50+02:00
 * @Email:  guillaume.gence@univ-lyon1.fr
 * @Last modified by:   guigen
 * @Last modified time: 2017-07-05T16:17:56+02:00
 */


recTreeVisu.map = function (recTree){
  var spTreeLayout = _spTreeLayout();
  var recGnTreesLayout = _recGnTreesLayout();
  spTreeLayout(recTree.rootSpTree);
  recGnTreesLayout(recTree.rootsRecGnTrees);
}

function _spTreeLayout() {

  // TODO:
  // Les coordonnées du container doivent etre calculer en fonction du nb d'evenement et du nb d'histoires de gênes.
  var defaultSize = {
    width : 300,
    height : 500
  },
  eventSize = 50,
  historySize = 20;

  function spTreeLayout(root) {

    var size = defaultSize,
        maxDepth,
        separationHeight,
        separationWidth,
        numberOfNodes,
        y = 0,
        x = 0,
        leaves;

    root.constructor.prototype.inOrderTraversal = _inOrderTraversal;
    root.constructor.prototype.getMaxDepthX = function () {
      return size.width;
    };

    numberOfNodes = root.descendants().length;
    separationHeight = size.height / numberOfNodes;
    root.inOrderTraversal(function (d) {
      // TODO:
      // Refaire en fonction du nb d'histoire
      y += separationHeight;
      d.y = y;
      y += separationHeight;

      // TODO:
      // Placement différent si un des enfant est une espece morte
      // if(d.children && d.children[0] && d.children[0].dead){
      //   d.y = d.children[0].y;
      // }else if (d.children && d.children[1] && d.children[1].dead) {
      //   d.y = d.children[1].y;
      // }else {
      //   d.y = y;
      // }
    });

    // maxDepth = _maxDepth(root);
    // separationWidth = size.width / (maxDepth + 1);
    root.x = 50;
    maxDepth = 0;
    root.each(function (d) {
      // d.x = d.depth * separationWidth;
      if(d.parent){
        d.x = d.parent.x + eventSize + (historySize*2);
      }

      if(d.x > maxDepth){
        maxDepth = d.x;
      }

    });


    //Compute container position
    root.each(function (d) {

      d.container = {
        start : {up : {} ,down : {}  },
        stop : {up : {}  ,down : {}  }
      };

      d.container.start.up.x = d.x;
      d.container.start.up.y = d.y - historySize;

      d.container.start.down.x = d.x;
      d.container.start.down.y = d.y + historySize;

      d.container.stop.up.x = d.x + eventSize ;
      d.container.stop.up.y = d.container.start.up.y;

      d.container.stop.down.x = d.container.stop.up.x  ;
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


function _recGnTreesLayout() {
  function recGnTreesLayout(roots) {

  }
  return recGnTreesLayout;
}
function _inOrderTraversal (callback){
   var node = this, next = [], children;
   children = node.children;

   if(children && children[0]){
     children[0].inOrderTraversal(callback);
   }

   callback(node);

   if(children && children[1]){
     children[1].inOrderTraversal(callback);
   }

   return this;
}
