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

  documentNbGeneAndEventInSpTree(rootsClades);

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

  if (node.parent.data.clade[0] === node.data) {
    node.position = 0;
  } else if (node.parent.data.clade[1] === node.data) {
    node.position = 1;
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
  outGnsBrothers = getOutGnsBrothers(outGns,recTree);
  undGns = getUndGns(recTree.rootsRecGnTrees);

  manageOutGns(outGns, recTree);
  manageOutGnsBrothers(outGnsBrothers, recTree);
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

// FIXME:Gerer de mettre les species Location des fils duplication dans le bon _0 de l'arbre
//
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

// function manageLossGn (outGn,rootSpTree) {
//   var currentSpeciesLocation = outGn.data.eventsRec[0].speciesLocation;
//   switch (currentSpeciesLocation) {
//     case 'out':
//       outGn.data.eventsRec[0].speciesLocation = outGn.parent.data.eventsRec[0].speciesLocation;
//       break;
//     case 'undefined':
//       getSpeciesLocationForUndefined(outGn,rootSpTree);
//       break;
//     default:
//       recTreeVisu.error('currentSpeciesLocation non autorisé: ' + currentSpeciesLocation);
//   }
// }



function documentNbGeneAndEventInSpTree (rootsClades) {
  var recTree;

  recTree = recTreeVisu._computeHierarchy(rootsClades);
  CreateGenesArrayInEachSp(recTree);
  UpdateNbGeneAndEventInSpTree(recTree);
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

      gnClade.species = species;
    }
  }
}

// TODO UpdateNbGeneAndEventInSpTree
// A partir du tableau de gènes de chaque espèces donner le nombre de ligne et de colonne necessaire pour le représenter.
function UpdateNbGeneAndEventInSpTree (recTree) {
  var rootRecGnTree,
      gnNodes,
      gnNode,
      eventType,
      currentSpecies;

  for ( rootRecGnTree of recTree.rootsRecGnTrees) {
    gnNodes = rootRecGnTree.descendants();
    for ( gnNode of gnNodes) {
      eventType = gnNode.data.eventsRec[0].eventType;
      currentSpecies = gnNode.data.species.data;
      switch (eventType) {
        case 'speciation':
        case 'speciationLoss':
        case 'speciationOutLoss':
        case 'speciationOut':
        case 'leaf':
        case 'loss':
          addGnHistoryInSpecies(currentSpecies);
          break;
        default:
      }
    }
  }
  // TEST :)
  // for (node of recTree.rootSpTree.descendants()) {
  //   console.log(node.data.name)
  //   console.log(node.data.nbGnStories)
  //   console.log("---------")
  // }
}

function addGnHistoryInSpecies(speciesCl) {
  if(!speciesCl.nbGnStories) {
    speciesCl.nbGnStories = 1;
  }else {
    speciesCl.nbGnStories++;
  }
}
