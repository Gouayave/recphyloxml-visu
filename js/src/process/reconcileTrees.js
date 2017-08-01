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

  giveSpeciesLocationForAllGn(rootsClades, gnTreesAppendices);

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

// TODO: Ecrire giveSpeciesLocationForAllGn
// Donner à chaque gène une speciesLocation
// La speciesLocation permet de donner le nombre de gènes par espèces
function giveSpeciesLocationForAllGn (rootsClades, deadSpecies) {
  var recTree;
  var outGns;
  var outGnsBrothers;
  var undGns;

  recTree = recTreeVisu._computeHierarchy(rootsClades);

  outGns = getOutGns(recTree.rootsRecGnTrees);
  manageOutGns(outGns, recTree);

  outGnsBrothers = getOutGnsBrothers(outGns,recTree);
  manageOutGnsBrothers(outGnsBrothers, recTree);

  undGns = getUndGns(recTree.rootsRecGnTrees);
  manageUndGns(undGns, recTree.rootSpTree);


}

function getOutGns (rootsRecGnTrees) {
  var outGn;
  var allGn;
  var result = [];
  var rootRecGnTree;

  for (rootRecGnTree of rootsRecGnTrees) {
    allGn = rootRecGnTree.descendants();
    outGn = allGn.filter(function (gn) {
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

  for (outGn of outGns) {
    eventsRec = outGn.data.eventsRec[0];
    switch (eventsRec.eventType) {
      case 'bifurcationOut':
        outGn.data.eventsRec[0].speciesLocation = outGn.data.sourceSpecies + '_out';
        break;
      case 'transferBack':
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

    switch (parentEventType) {
      case 'bifurcationOut':
        outGn.data.eventsRec[0].speciesLocation = parentCl.sourceSpecies + '_out';
        break;
      case 'speciationOut':
      case 'speciationOutLoss':
        outGn.data.eventsRec[0].speciesLocation =  outGn.data.sourceSpecies + '_out';
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
      posChild = outGn.posChild;
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
  var allGn;
  var result = [];
  var rootRecGnTree;

  for (rootRecGnTree of rootsRecGnTrees) {
    allGn = rootRecGnTree.descendants();
    outGn = allGn.filter(function (gn) {
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
    posChild = undGn.posChild;
    posBrotherChild = posChild  === 1 ? 0 : 1;
    brotherSpLocation = undGn.parent.data.clade[posBrotherChild].eventsRec[0].speciesLocation;
    brotherSp = findNodeByName(brotherSpLocation,rootSpTree);
    posBrotherSp = brotherSp.posChild;
    posSp = posBrotherSp  === 1 ? 0 : 1;
    spLocation = brotherSp.parent.data.clade[posSp].name;
    undGn.data.eventsRec[0].speciesLocation = spLocation;
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
  }
}


// FIXME !!!! Ne marche pas pour le moment: BLOQUANT !
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
        eventType = child.data.eventsRec[0].eventType;
        updateCorridors(child,recTree);
      }
    }

  if(!node.data.species.nbCorridors){
    node.data.species.nbCorridors = 0;
  }

  if(!node.data.species.nbGnEvents){
    node.data.species.nbGnEvents = 0;
  }

  if(!node.data.species.currentNbGnEvents){
    node.data.species.currentNbGnEvents = 0;
  }

  // On associe le corridor a chaque espèce
  nodeEventType = node.data.eventsRec[0].eventType;
  node.data.corridor = node.data.species.nbCorridors;

  switch (nodeEventType) {
    case 'loss':
      node.data.species.currentNbGnEvents = 0;
      updateNbGnEvents(node.data.species);
      ++node.data.species.nbCorridors;
      break;
    case 'leaf':
    case 'loss':
    case 'speciation':
    case 'speciationLoss':
    case 'speciationOut':
    case 'speciationOutLoss':
      node.data.species.currentNbGnEvents = 0;
      ++node.data.species.nbCorridors;
      break;

    case 'bifurcationOut':
    case 'duplication':
    case 'transferBack':
      updateNbGnEvents(node.data.species);
      break;
    default:
      recTreeVisu.error('Evenement non autorisé: ' + nodeEventType);
  }


}

function updateNbGnEvents(species) {
  var currentNbGnEvents,
      nbGnEvents;

  currentNbGnEvents = ++species.currentNbGnEvents;
  nbGnEvents = species.nbGnEvents

  if( currentNbGnEvents > nbGnEvents){
    species.nbGnEvents = currentNbGnEvents;
  }
}
