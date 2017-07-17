
function _flatTrees(rootsClades) {
  var newRootsClades = {
    rootSpTree : undefined,
    rootsRecGnTrees : undefined
  };

  newRootsClades.rootSpTree = rootsClades.rootSpTree;
  newRootsClades.rootsRecGnTrees = rootsClades.rootsRecGnTrees.map(function (rootRecGnTree) {
    return _flatTree(rootRecGnTree)
  })

  return newRootsClades;
}


var defaultConfig = {
  transferBack : true,
  speciationLoss : true,
  speciationOutLoss : true,
}

function _flatTree(treeRoot,config = defaultConfig) {

  var virtualRoot = {
    name : "Out",
    eventsRec : treeRoot.eventsRec,
    clade : [treeRoot]
  }

  treeRootNode = d3.hierarchy(virtualRoot,function(d) {
    return d.clade;
  });

  treeRootNode.each(function (node) {

    if(node.children && node.children.length)
    {
      node.children.forEach(function (child,posChild) {

        var eventsRec = child.data.eventsRec;
        var newEvent = null;
        var startNode = undefined;
        var currentNode = undefined;


        while (eventsRec && (newEvent = eventsRec.shift())){
          switch (newEvent.eventType) {
            case "speciationLoss":
              var newChildName = child.data.name+"_SpL";
              var lossChildName = child.data.name+"_Loss";
              if(config.speciationLoss == false)
              {
                var newChild = createNewSubTree(newChildName,newEvent);
              }
              else {
                var newChild = createNewSubTreeWithChild(newChildName,newEvent,lossChildName,"undefined");
              }

              if(!startNode && !currentNode)
              {
                startNode = newChild;
                currentNode = newChild;
              }else {
                currentNode.clade.push(newChild);
                currentNode = newChild;
              }


              break;


            case "speciationOutLoss":
                var newChild;
                var newChildName = child.data.name+"_SpOL";
                var lossChildName = child.data.name+"_Loss";

                if(config.speciationOutLoss == false)
                {
                  newChild = createNewSubTree(newChildName,newEvent);
                }
                else {
                  newChild = createNewSubTreeWithChild(newChildName,newEvent,lossChildName,newEvent.speciesLocation);
                }

                if(!startNode && !currentNode){
                  startNode = newChild;
                  currentNode = newChild;
                }else {
                  currentNode.clade.push(newChild);
                  currentNode = newChild;
                }

              break;

            case "transferBack":
                var newChildName = child.data.name+"_TrB";
                var lossChildName = child.data.name+"_Loss";
                if(config.transferBack == false)
                {
                  var newChild = createNewSubTree(newChildName,newEvent);
                }
                else {
                  var newChild = createNewSubTreeWithChild(newChildName,newEvent,lossChildName,"out");
                }

                if(!startNode && !currentNode)
                {
                  startNode = newChild;
                  currentNode = newChild;
                }else {
                  currentNode.clade.push(newChild);
                  currentNode = newChild;
                }

              break;

            default:
              child.data.eventsRec = [newEvent];
          }
        }
        if(startNode && currentNode)
        {
          node.data.clade[posChild] = startNode;
          currentNode.clade.push(child.data);
        }

      });
    }
  });


  return virtualRoot.clade[0];
}

function createNewSubTreeWithChild(nodeName,nodeEvent,childName,childSpeciesLocation) {
  return {
    name : nodeName,
    eventsRec : [nodeEvent],
    clade : [
      {
        name: childName,
        eventsRec : [{eventType: 'loss' , speciesLocation: childSpeciesLocation}]
      }
    ]
  }
}

function createNewSubTree(nodeName,nodeEvent) {
  return {
    name : nodeName,
    eventsRec : [nodeEvent],
    clade : []
  }
}


//Insert a short subTree in a tree
// function insertSubTree(root, subTreeRoot) {
//   var oldSubTree = root.clade[posSubTree];
//   root.clade[posSubTree] = subTreeRoot;
//   subTreeRoot.clade.push(oldSubTree);
// }


// function createNewSubTree(nodeName,nodeEvent) {
//   return {
//     subName : nodeName,
//     event : nodeEvent,
//     clade : []
//   }
// }
