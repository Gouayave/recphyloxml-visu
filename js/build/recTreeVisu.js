/**
 * @Author: Guillaume GENCE <guigen>
 * @Date:   2017-07-05T15:05:19+02:00
 * @Email:  guillaume.gence@univ-lyon1.fr
 * @Last modified by:   guigen
 * @Last modified time: 2017-07-05T16:30:30+02:00
 */

var recTreeVisu = {};

recTreeVisu.vizualize = function (recPhyloXML, domContainerId) {
  var rootsClades;
  var recTrees;
  // Parse le recPhyloXML, créer les branches mortes et stock dans un objet de type recTree
  rootsClades = recTreeVisu.process(recPhyloXML);
  // console.log(treeify.asTree(rootsClades, true));
  // Calcul la position des elements de recTree (noueds, branches) dans un repère en 2 dimensions
  recTrees = recTreeVisu.map(rootsClades);

 //  console.log(
 //   treeify.asTree(rootsClades, true)
 // );
  // Genere le svg dans le container domContainerId
  recTreeVisu.render(recTrees, domContainerId);

};

recTreeVisu.error = function (msgStr) {
  return {msg: msgStr};
};
/**
 * @Author: Guillaume GENCE <gence>
 * @Date:   2017-07-12T10:22:26+02:00
 * @Email:  guillaume.gence@univ-lyon1.fr
 * @Last modif ied by:   gence
 * @Last modif ied time: 2017-07-12T14:27:09+02:00
 */

 // Source : https://stackoverflow.com/questions/4200913/xml-to-javascript-object#19448718
recTreeVisu.parseRecPhyloXML = function (xml) {
  var dom = null;
  var objRecPhyloXML = {};
  var error = {};
  var arrayTags = ['clade', 'recGeneTree'];

  if (window.DOMParser) {
    dom = (new DOMParser()).parseFromString(xml, 'text/xml');
  } else if (window.ActiveXObject) {
    dom = new ActiveXObject('Microsoft.XMLDOM');
    dom.async = false;
    if (!dom.loadXML(xml)) {
      error.msg = dom.parseError.reason + ' ' + dom.parseError.srcText;
      throw error;
    }
  } else {
    error.msg = 'cannot parse xml string!';
    throw error;
  }

  function isArray (o) {
    return Object.prototype.toString.apply(o) === '[object Array]';
  }

  function parseNode (xmlNode, objRecPhyloXML, xmlNodeParent) {
    var length;
    var i;

    if (xmlNodeParent.nodeName === 'name') {
      objRecPhyloXML['value'] = xmlNode.nodeValue;
      return;
    }

    if (xmlNode.nodeName === '#text' && xmlNode.nodeValue.trim() === '') {
      return;
    }

    var jsonNode = {};
    var existing = objRecPhyloXML[xmlNode.nodeName];

    if (xmlNodeParent.nodeName !== 'eventsRec') {
      if (existing) {
        if (!isArray(existing)) {
          objRecPhyloXML[xmlNode.nodeName] = [existing, jsonNode];
        } else {
          objRecPhyloXML[xmlNode.nodeName].push(jsonNode);
        }
      } else {
        if (arrayTags && arrayTags.indexOf(xmlNode.nodeName) !== -1) {
          objRecPhyloXML[xmlNode.nodeName] = [jsonNode];
        } else {
          objRecPhyloXML[xmlNode.nodeName] = jsonNode;
        }
      }
    }

    if (xmlNode.attributes) {
      length = xmlNode.attributes.length;
      for (i = 0; i < length; i++) {
        var attribute = xmlNode.attributes[i];
        jsonNode[attribute.nodeName] = attribute.nodeValue;
      }
    }

    if (xmlNode.nodeName === 'eventsRec') {
      jsonNode.listEvents = [];
    }

    if (xmlNodeParent.nodeName === 'eventsRec') {
      var name = xmlNode.nodeName;
      var obj = {
        name: name,
        attr: jsonNode
      };
      objRecPhyloXML.listEvents.push(obj);
    }

    length = xmlNode.childNodes.length;
    // Rajout perso

    for (i = 0; i < length; i++) {
      parseNode(xmlNode.childNodes[i], jsonNode, xmlNode);
    }
  }

  if (dom.childNodes.length) {
    parseNode(dom.childNodes[0], objRecPhyloXML, {});
  }

  // assert
  if (!objRecPhyloXML.recPhylo) {
    window.alert('Error during parse recPhyloXML.');
    error.msg = 'Error during parse recPhyloXML.';
    throw error;
  }

  objRecPhyloXML = _getRootsClades(objRecPhyloXML);
  _formatWithoutListEvents(objRecPhyloXML);

  return objRecPhyloXML;
};

// On récupére les clades racines des arbres
function _getRootsClades (objRecPhyloXML) {
  var rootsClades = {};
  var i = 0;

  // Get clades Root
  rootsClades.rootSpTree = _.get(objRecPhyloXML, 'recPhylo.spTree.phylogeny.clade[0]');
  rootsClades.rootsRecGnTrees = _.map(_.get(objRecPhyloXML, 'recPhylo.recGeneTree'), (phylogeny) => {
    var root = _.get(phylogeny, 'phylogeny.clade[0]');
    root.idTree = ++i;
    return root;
  });

  return rootsClades;
}

// Correction des elements nouveaux lors du parsage inutiles lors du parsage du xml
function _formatWithoutListEvents (objRecPhyloXML) {
  var rootsHierarchy,
    rootsRecGnTrees,
    rootSpTree,
    nodes,
    listEvents,
    name,
    clade;

  rootsHierarchy = recTreeVisu._computeHierarchy(objRecPhyloXML);

  // Dans l'arbre des espèces
  rootSpTree = rootsHierarchy.rootSpTree;
  nodes = rootSpTree.descendants();
  for (var node of nodes) {
    clade = node.data;
    // On enlève le name value et on le met dans le name
    name = clade.name.value;
    clade.name = name;
    // On enlève les #comment
    delete clade['#comment'];
  }

  // Dans les arbres de gènes
  rootsRecGnTrees = rootsHierarchy.rootsRecGnTrees;
  for (var rootRecGnTrees of rootsRecGnTrees) {
    nodes = rootRecGnTrees.descendants();
    for (node of nodes) {
      clade = node.data;
      // On enlève le listEvents
      listEvents = clade.eventsRec.listEvents;
      clade.eventsRec = listEvents;
      // On format le recEvent
      for (var ev of listEvents) {
        ev.eventType = ev.name;
        delete ev['name'];

        if (ev.attr && ev.attr.speciesLocation) {
          ev.speciesLocation = ev.attr.speciesLocation;
        }

        if (ev.attr && ev.attr.destinationSpecies) {
          ev.destinationSpecies = ev.attr.destinationSpecies;
        }

        if (ev.attr && ev.attr.geneName) {
          ev.geneName = ev.attr.geneName;
        }
        delete ev['attr'];
      }

      // On enlève le name value et on le met dans le name
      name = clade.name.value;
      clade.name = name;
      // On enlève les #comment
      delete clade['#comment'];
    }
  }
}

// Compute hierarchy data
recTreeVisu._computeHierarchy = function (rootsClades) {
  var rootsHierarchy = {};
  var idTree = 0;

  // Compute D3 hierarchical layout
  function returnClade (d) {
    return d.clade;
  }

  rootsHierarchy.rootSpTree = d3.hierarchy(rootsClades.rootSpTree, returnClade);
  // Add position child from his parent for futur use
  rootsHierarchy.rootSpTree.each(function (d) {
    if (d.children && d.children[0]) {
      d.children[0].data.posChild = 0;
    }

    if (d.children && d.children[1]) {
      d.children[1].data.posChild = 1;
    }

    if(d.parent){
      d.data.posParent = d.parent.data.posChild;
    }

  });

  rootsHierarchy.rootsRecGnTrees = _.map(rootsClades.rootsRecGnTrees, (root) => {
    var rootRecGnTrees = d3.hierarchy(root, returnClade);
    idTree++;
    rootRecGnTrees.each(function (d) {
      d.data.idTree = idTree;
      if (d.children && d.children[0]) {
        d.children[0].data.posChild = 0;
      }

      if (d.children && d.children[1]) {
        d.children[1].data.posChild = 1;
      }
    });
    return rootRecGnTrees;
  });

  return rootsHierarchy;
};
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
        var name, newChild, newChildName, lossChildName;

        if (eventsRec) {
          do {
            newEvent = eventsRec.shift();

            if (newEvent) {
              switch (newEvent && newEvent.eventType) {
                case 'speciationLoss':
                  name = child.data.eventsRec[0].geneName || child.data.name;
                  newChildName = name + '_SpL';
                  lossChildName = name + '_Loss';

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
                  name = child.data.eventsRec[0].geneName || child.data.name;
                  newChildName = name + '_SpOL';
                  lossChildName = name + '_Loss';

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
                  name = child.data.eventsRec[0].geneName || child.data.name;
                  newChildName = name + '_TrB';
                  lossChildName = name + '_Loss';

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
/**
 * @Author: Guillaume GENCE <gence>
 * @Date:   2017-07-12T14:25:18+02:00
 * @Email:  guillaume.gence@univ-lyon1.fr
 * @Last modified by:   gence
 * @Last modified time: 2017-07-13T11:25:11+02:00
 */

recTreeVisu.reconcileTrees = function (rootsClades) {
  var rootsHierarchy,
    gnTreesAppendices,
    deadSpecies;

  rootsHierarchy = recTreeVisu._computeHierarchy(rootsClades);

  gnTreesAppendices = findGnTreesAppendices(rootsHierarchy.rootsRecGnTrees);

  deadSpecies = createDeadSpFromGnTrees(gnTreesAppendices);

  addDeadSpecies(rootsClades.rootSpTree, deadSpecies);

  giveSpeciesLocationForallGenes(rootsClades, gnTreesAppendices);

  addChilGnInNewSpecies(rootsClades,deadSpecies);

  // IDEA documentNbGeneAndEventInSpTree
  // Il faudrait utiliser les corridors pour placer les evenements
  // documentNbGeneAndEventInSpTree(rootsClades);

  getGnCorridors(rootsClades);

  return rootsClades;
};

function findGnTreesAppendices (rootsRecGnTrees) {
  var speciationOuts,
    rootRecGnTree,
    eventType;
  var gnTreesAppendices = [];

  for (rootRecGnTree of rootsRecGnTrees) {
    // Find speciationOuts
    speciationOuts = rootRecGnTree.descendants().filter(function (node) {
      eventType = node.data.eventsRec[0].eventType;
      return eventType === 'speciationOut' || eventType === 'speciationOutLoss';
    });
    // Search appendices in from speciationOuts
    gnTreesAppendices.push(speciationOuts.map(function (speciationOut) {
      speciationOut.data.clade[1].sourceSpecies = speciationOut.data.eventsRec[0].speciesLocation;
      return speciationOut.data.clade[1];
    }));
  }
  gnTreesAppendices = _.flatten(gnTreesAppendices);
  return gnTreesAppendices;
}

// Compare les nouveaux appendices de l'arbre de espèces et les fusionnes pour éviter les doublons out.
function createDeadSpFromGnTrees (deadSpecies) {
  var concernSpecies, cs;
  var keepSpecies = [];
  var outSp;

  concernSpecies = deadSpecies.map(function (ds) {
    return ds.sourceSpecies;
  });
  concernSpecies = _.uniq(concernSpecies);

  for (cs of concernSpecies) {
    outSp = {};
    outSp.sourceSpecies = cs;
    outSp.name = cs + '_out';
    outSp.out = true;
    keepSpecies.push(outSp);
  }
  return keepSpecies;
}

// Ajouter dans l'arbre des espèces
function addDeadSpecies (rootSpTree, deadSpecies) {
  var appendix;
  var sourceSpecies;
  var node;
  var newClade;
  var hierarchySpTree;
  var childrens;

  for (appendix of deadSpecies) {
    newClade = {};

    hierarchySpTree = d3.hierarchy(rootSpTree, function (node) {
      return node.clade;
    });

    sourceSpecies = appendix.sourceSpecies;
    node = findNodeByName(sourceSpecies, hierarchySpTree);

    childrens = node.data.clade;
    if (childrens) {
      newClade.clade = childrens;
    }
    newClade.name = sourceSpecies + '_0';
    newClade.sameAsParent = true;

    node.data.clade = [appendix, newClade];
  }

  return rootSpTree;
}

// Rechercher un clade par son nom dans l'arbre des espèces
function findNodeByName (speciesLocation, hierarchySpTree) {
  var node;

  node = hierarchySpTree.descendants().find(function (n) {
    return n.data.name === speciesLocation;
  });

  // Assert
  if (!node) {
    var msg = {};
    msg.error = 'There is a mismatch in reconcile method; spLocation : ' + speciesLocation.toString();
    throw msg;
  }

  return node;
}


// FIXME
// IL faut proablement refaire cette méthode
// Elle permet d'ajouter des noueds dans les novelles espèces créer _0 et _out lors d'une spOut ou un spOutLoss
function addChilGnInNewSpecies (rootsClades, deadSpecies) {
  var recTree,
      concernSpecies;

  concernSpecies = deadSpecies.map(function (ds) {
    return ds.sourceSpecies;
  });
  concernSpecies = _.uniq(concernSpecies);

  recTree = recTreeVisu._computeHierarchy(rootsClades);
  recTree.rootsRecGnTrees.forEach(function (rootRecGnTree) {
    allGenes = rootRecGnTree.descendants();
    allGenes.forEach(function (gn) {

      var speciesLocation = gn.data.eventsRec[0].speciesLocation;
      var index = concernSpecies.indexOf(speciesLocation);

      if(index !== -1){
        if(isConcernedBySpecOut(gn)){
          addChildForMatchedGn(gn);
        }
      }
    });
  });
}

function isConcernedBySpecOut (gn) {

  var eventType = gn.data.eventsRec[0].eventType;
  var isTheOutChild = !!gn.data.sourceSpecies;
  //return  (eventType === 'speciation' || eventType === 'leaf') ;
  return eventType !== "speciationOutLoss" && eventType !== 'speciationOut' && eventType !== 'duplication' && !isTheOutChild;
}

function addChildForMatchedGn(gn) {


  if(gn.parent){
    var name = gn.data.name;
    var speciesLocationParent = gn.data.eventsRec[0].speciesLocation;
    var eventsRecParent = [{eventType:'speciationOut', speciesLocation: speciesLocationParent}];


    var speciesLocationLoss = gn.data.eventsRec[0].speciesLocation + '_out';
    var eventsRecLoss = [{eventType:'loss', speciesLocation: speciesLocationLoss}];
    var lossGn = {
      name : 'loss',
      eventsRec : eventsRecLoss,
      deadOutGn : true,
      out : true
    }

    gn.data.eventsRec[0].speciesLocation = speciesLocationParent+'_0';
    gn.data.eventsRec[0].sameSpAsParent = true;

    var clades = [gn.data,lossGn]
    var newClade = {
      name : name,
      eventsRec : eventsRecParent,
      clade : clades
    }
    gn.parent.data.clade[gn.data.posChild] = newClade;
  }




}


// TODO: Ecrire giveSpeciesLocationForallGenes
// Donner à chaque gène une speciesLocation
// La speciesLocation permet de donner le nombre de gènes par espèces
function giveSpeciesLocationForallGenes (rootsClades, deadSpecies) {
  var recTree;
  var outGns;
  var outGnsBrothers;
  var undGns;

  recTree = recTreeVisu._computeHierarchy(rootsClades);


  outGns = getOutGns(recTree.rootsRecGnTrees);
  manageOutGns(outGns, recTree);
  console.log(outGns);

  outGnsBrothers = getOutGnsBrothers(outGns,recTree);
  manageOutGnsBrothers(outGnsBrothers, recTree);
  console.log(outGnsBrothers);

  undGns = getUndGns(recTree.rootsRecGnTrees);
  manageUndGns(undGns, recTree.rootSpTree);
  console.log(undGns);

}

function getOutGns (rootsRecGnTrees) {
  var outGn;
  var allGenes;
  var result = [];
  var rootRecGnTree;

  for (rootRecGnTree of rootsRecGnTrees) {
    allGenes = rootRecGnTree.descendants();
    outGn = allGenes.filter(function (gn) {
      var eventsRec = gn.data.eventsRec[0];
      return !eventsRec.speciesLocation || eventsRec.speciesLocation === 'out';
    });
    result = result.concat(outGn);
  }
  return result;
}

function manageOutGns(outGns,recTree) {
  var outGn;
  var eventsRec;
  var sourceSpecies;

  for (outGn of outGns) {
    eventsRec = outGn.data.eventsRec[0];
    switch (eventsRec.eventType) {
      case 'bifurcationOut':
        outGn.data.out = true;
        sourceSpecies = outGn.data.sourceSpecies || outGn.parent.data.eventsRec[0].speciesLocation || outGn.parent.data.eventsRec[0].sourceSpecies;

        if(!outGn.parent.data.eventsRec[0].sourceSpecies){
          outGn.data.eventsRec[0].sourceSpecies = sourceSpecies + '_out';
        }else {
          outGn.data.eventsRec[0].sourceSpecies = sourceSpecies;
        }
        break;
      case 'transferBack':
        outGn.data.out = true;
        manageTrBack(outGn);
        break;
      case 'loss':
        outGn.data.eventsRec[0].speciesLocation = outGn.parent.data.eventsRec[0].speciesLocation;
        break;
      default:
        recTreeVisu.error('Evenement non autorisé: ' + eventsRec.eventType);
    }
  }
}

function manageTrBack (outGn) {
    var parentCl = outGn.parent.data;
    var parentEventType = parentCl.eventsRec[0].eventType;
    var sourceSpecies;

    switch (parentEventType) {
      case 'bifurcationOut':
        sourceSpecies = outGn.data.sourceSpecies || outGn.parent.data.eventsRec[0].sourceSpecies;
        outGn.data.eventsRec[0].speciesLocation = sourceSpecies;
        break;
      case 'speciationOut':
      case 'speciationOutLoss':
        sourceSpecies = outGn.data.sourceSpecies || outGn.parent.data.eventsRec[0].speciesLocation;
        outGn.data.eventsRec[0].speciesLocation =  sourceSpecies + '_out';
        break;
      default:
        recTreeVisu.error('Evenement parent non autorisé: ' + parentEventType);
    }
    //outGn.data.eventsRec[0].speciesLocation = outGn.parent.data.eventsRec[0].speciesLocation+ '_out';
}

function getOutGnsBrothers(outGns) {
  var outGn,
      parentEventType,
      posChild,
      posBrotherChild,
      brother,
      outGnsBrothers = [];

  for (outGn of outGns) {
    parentEventType = outGn.parent.data.eventsRec[0].eventType;
    if(parentEventType === 'speciationOut' || parentEventType === 'speciationOutLoss'){
      posChild = outGn.data.posChild;
      posBrotherChild = posChild  === 1 ? 0 : 1;
      brother = outGn.parent.data.clade[posBrotherChild];
      outGnsBrothers.push(brother)
    }
  }
  return outGnsBrothers;
}


function manageOutGnsBrothers (outGnsBrothers, recTree) {
  var outGnsBrother,
      speciesLocation;

  for (outGnsBrother of outGnsBrothers) {
    outGnsBrother.eventsRec[0].speciesLocation = outGnsBrother.eventsRec[0].speciesLocation + '_0';
  }

}

function getUndGns(rootsRecGnTrees) {
  var outGn;
  var allGenes;
  var result = [];
  var rootRecGnTree;

  for (rootRecGnTree of rootsRecGnTrees) {
    allGenes = rootRecGnTree.descendants();
    outGn = allGenes.filter(function (gn) {
      var eventsRec = gn.data.eventsRec[0];
      return !eventsRec.speciesLocation || eventsRec.speciesLocation === 'undefined';
    });
    result = result.concat(outGn);
  }
  return result;
}

function manageUndGns(undGns,rootSpTree) {
  var undGn,
      posChild,
      posBrotherChild,
      brotherSpLocation,
      brotherSp,
      posBrotherSp,
      posSp,
      spLocation;

  for (undGn of undGns) {
    if(undGn.data.eventsRec[0].sourceSpecies){
      undGn.data.eventsRec[0].speciesLocation = undGn.data.eventsRec[0].sourceSpecies;
    }else {
      posChild = undGn.data.posChild;
      posBrotherChild = posChild  === 1 ? 0 : 1;
      brotherSpLocation = undGn.parent.data.clade[posBrotherChild].eventsRec[0].speciesLocation;
      brotherSp = findNodeByName(brotherSpLocation,rootSpTree);
      posBrotherSp = brotherSp.data.posChild;
      posSp = posBrotherSp  === 1 ? 0 : 1;
      spLocation = brotherSp.parent.data.clade[posSp].name;
      undGn.data.eventsRec[0].speciesLocation = spLocation;
    }
  }
}

// Cette fonction associe les pointeurs d'espèces et de gènes entre eux
function CreateGenesArrayInEachSp (recTree) {
  var rootRecGnTree;
  var gnNodes;
  var gnNode;
  var speciesLocation;
  var species;
  var speciesCl;
  var gnClade;
  var genes;

  for (rootRecGnTree of recTree.rootsRecGnTrees) {
    gnNodes = rootRecGnTree.descendants();
    for (gnNode of gnNodes) {

      speciesLocation = gnNode.data.eventsRec[0].speciesLocation;
      species = findNodeByName(speciesLocation, recTree.rootSpTree);

      speciesCl = species.data;
      gnClade = gnNode.data;

      if (!speciesCl.genes) {
        speciesCl.genes = [];
      }
      genes = speciesCl.genes;
      genes.push(gnClade);

      gnClade.species = species.data;
    }
  }
}

// On donne à chaque gènes un numéro de corridor dans l'espèces
function getGnCorridors (rootsClades) {
  var recTree;

  recTree = recTreeVisu._computeHierarchy(rootsClades);

  // FIXME changer le nom de la fonction CreateGenesArrayInEachSp
  CreateGenesArrayInEachSp(recTree);

  for (rootRecGnTree of recTree.rootsRecGnTrees) {
    updateCorridors(rootRecGnTree,recTree);
    updateNbEvents(rootRecGnTree,recTree);
  }
}

function updateCorridors (node,recTree) {
  var nodeEventType,
      child,
      childEventType,
      children,
      corridor;

  // On fait la récursion
  children = node.children;

  if(children){
    for (child of children) {
      updateCorridors(child,recTree);
    }
  }

  if(!node.data.species.nbCorridors){
    node.data.species.nbCorridors = 0;
  }

  // On associe le corridor et l'evenement à chaque espèce
  nodeEventType = node.data.eventsRec[0].eventType;

  switch (nodeEventType) {
    case 'loss':
    case 'leaf':
    case 'speciation':
    case 'speciationLoss':
    case 'speciationOut':
    case 'speciationOutLoss':
      if(!node.data.deadOutGn){
        ++node.data.species.nbCorridors;
      }
      break;
    case 'bifurcationOut':
    case 'duplication':
    case 'transferBack':
      break;
    default:
      recTreeVisu.error('Evenement non autorisé: ' + nodeEventType);
  }

  node.data.idCorridor = node.data.species.nbCorridors;

}

// IDEA ya moyen de faire mieux :)
function updateNbEvents (node,recTree) {
  var nodeEventType,
      child,
      childEventType,
      children;

  if(!node.data.species.nbGnEvents){
    node.data.species.nbGnEvents = 0;
  }

  if(!node.data.species.currentNbGnEvents){
    node.data.species.currentNbGnEvents = 0;
  }

  // On associe le corridor et l'evenement à chaque espèce
  nodeEventType = node.data.eventsRec[0].eventType;

  switch (nodeEventType) {
    case 'loss':
    case 'leaf':
    case 'speciation':
    case 'speciationLoss':
    case 'speciationOut':
    case 'speciationOutLoss':
      node.data.idEvent= node.data.species.currentNbGnEvents;
      break;

    case 'bifurcationOut':
    case 'duplication':
    case 'transferBack':
      node.data.idEvent= node.data.species.currentNbGnEvents;
      updateNbGnEvents(node.data.species);
      break;
    default:
      recTreeVisu.error('Evenement non autorisé: ' + nodeEventType);
  }

  // On fait la récursion
  children = node.children;
  if(children){
    updateNbEvents(children[0],recTree);
    updateNbEvents(children[1],recTree);
  }

}

function updateNbGnEvents(species) {
  var currentNbGnEvents,
      nbGnEvents;

  currentNbGnEvents = species.currentNbGnEvents++;
  nbGnEvents = species.nbGnEvents

  if( currentNbGnEvents > nbGnEvents){
    species.nbGnEvents = currentNbGnEvents;
  }
}
/**
* @Author: Guillaume GENCE <guigen>
* @Date:   2017-07-05T14:11:52+02:00
* @Email:  guillaume.gence@univ-lyon1.fr
* @Last modified by:   gence
* @Last modified time: 2017-07-12T14:27:04+02:00
*/

recTreeVisu.process = function (recPhyloXML) {
  var rootsClades;

  rootsClades = recTreeVisu.parseRecPhyloXML(recPhyloXML);

  rootsClades = recTreeVisu.flatGenesTrees(rootsClades);

  rootsClades = recTreeVisu.reconcileTrees(rootsClades);

  return rootsClades;
};
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

    root.each(function (d) {
      var nbGnEvents = d.data.nbGnEvents || 0;
          speciesWidth = eventSize + nbGnEvents * eventSize;

      d.speciesWidth = speciesWidth;

      if(d.data.out){
        d.parent.speciesWidth = d.parent.speciesWidth + d.speciesWidth;
      }

      if (d.parent) {
        d.x = d.parent.x + d.parent.speciesWidth + d.parent.speciesHeight;
      }


    });

    // Compute container position
    var  maxDepth = 0;
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


      if (d.container.stop.up.x > maxDepth) {
        maxDepth = d.container.stop.up.x;
      }

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
