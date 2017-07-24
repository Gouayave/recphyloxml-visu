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
function giveSpeciesLocationForAllGn (rootsClades, deadSpecies) {
  var recTree;
  var outGns;
  var eventsRec;
  var outGn;

  recTree = recTreeVisu._computeHierarchy(rootsClades);

  outGns = getAllOutGn(recTree.rootsRecGnTrees);
  for (outGn of outGns) {
    eventsRec = outGn.data.eventsRec[0];
    switch (eventsRec.eventType) {
      case 'bifurcationOut':
        outGn.data.eventsRec[0].speciesLocation = outGn.data.sourceSpecies + '_out';
        break;
      case 'transferBack':
        outGn.data.eventsRec[0].speciesLocation = outGn.parent.data.eventsRec[0].speciesLocation;
        break;
      case 'loss':
        outGn.data.eventsRec[0].speciesLocation = outGn.parent.data.eventsRec[0].speciesLocation;
        break;
      default:
        recTreeVisu.error('Evenement non autorisé: ' + eventsRec.eventType);
    }
  }
}

function getAllOutGn (rootsRecGnTrees) {
  var outGn;
  var allGn;
  var result = [];
  var rootRecGnTree;

  for (rootRecGnTree of rootsRecGnTrees) {
    allGn = rootRecGnTree.descendants();
    outGn = allGn.filter(function (gn) {
      var eventsRec = gn.data.eventsRec[0];
      return !eventsRec.speciesLocation || eventsRec.speciesLocation === 'out' || eventsRec.speciesLocation === 'undefined';
    });
    result = result.concat(outGn);
  }

  return result;
}

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

}
