recTreeVisu.flatGenesTrees = function (rootsClades) {
  var newRootsClades = {
    rootSpTree: undefined,
    rootsRecGnTrees: undefined
  };

  newRootsClades.rootSpTree = rootsClades.rootSpTree;
  newRootsClades.rootsRecGnTrees = rootsClades.rootsRecGnTrees.map(function (rootRecGnTree) {
    return flatTree(rootRecGnTree);
  });

  return newRootsClades;
};

var defaultConfig = {
  transferBack: true,
  speciationLoss: true,
  speciationOutLoss: true
};

function flatTree (treeRoot, config = defaultConfig) {
  var virtualRoot = {
    name: 'Out',
    eventsRec: treeRoot.eventsRec,
    clade: [treeRoot]
  };
  var treeRootNode;

  treeRootNode = d3.hierarchy(virtualRoot, function (d) {
    return d.clade;
  });

  treeRootNode.each(function (node) {

    if (node.children && node.children.length) {
      node.children.forEach(function (child, posChild) {
        var eventsRec = child.data.eventsRec;
        var newEvent = null;
        var startNode;
        var currentNode;
        var newChild, newChildName, lossChildName;

        if (eventsRec) {
          do {
            newEvent = eventsRec.shift();

            if (newEvent) {
              switch (newEvent && newEvent.eventType) {
                case 'speciationLoss':
                  newChildName = child.data.name + '_SpL';
                  lossChildName = child.data.name + '_Loss';

                  if (config.speciationLoss === false) {
                    newChild = createNewSubTree(newChildName, newEvent);
                  } else {
                    newChild = createNewSubTreeWithChild(newChildName, newEvent, lossChildName, 'undefined');
                  }

                  if (!startNode && !currentNode) {
                    startNode = newChild;
                    currentNode = newChild;
                  } else {
                    currentNode.clade.push(newChild);
                    currentNode = newChild;
                  }


                  break;

                case 'speciationOutLoss':
                  newChildName = child.data.name + '_SpOL';
                  lossChildName = child.data.name + '_Loss';

                  if (config.speciationOutLoss === false) {
                    newChild = createNewSubTree(newChildName, newEvent);
                  } else {
                    newChild = createNewSubTreeWithChild(newChildName, newEvent, lossChildName, newEvent.speciesLocation);
                  }

                  if (!startNode && !currentNode) {
                    startNode = newChild;
                    currentNode = newChild;
                  } else {
                    currentNode.clade.push(newChild);
                    currentNode = newChild;
                  }

                  break;

                case 'transferBack':
                  newChildName = child.data.name + '_TrB';
                  lossChildName = child.data.name + '_Loss';

                  if (config.transferBack === false) {
                    newChild = createNewSubTree(newChildName, newEvent);
                  } else {
                    newChild = createNewSubTreeWithChild(newChildName, newEvent, lossChildName, 'out');
                  }

                  if (!startNode && !currentNode) {
                    startNode = newChild;
                    currentNode = newChild;
                  } else {
                    currentNode.clade.push(newChild);
                    currentNode = newChild;
                  }

                  break;

                default:
                  child.data.eventsRec = [newEvent];
              }
            }
          } while (newEvent);
        }

        if (startNode && currentNode) {
          node.data.clade[posChild] = startNode;
          currentNode.clade.push(child.data);
        }
      });
    }
  });
  return virtualRoot.clade[0];
}

function createNewSubTreeWithChild (nodeName, nodeEvent, childName, childSpeciesLocation) {
  return {
    name: nodeName,
    eventsRec: [nodeEvent],
    clade: [
      {
        name: childName,
        eventsRec: [{eventType: 'loss', speciesLocation: childSpeciesLocation}]
      }
    ]
  };
}

function createNewSubTree (nodeName, nodeEvent) {
  return {
    name: nodeName,
    eventsRec: [nodeEvent],
    clade: []
  };
}
