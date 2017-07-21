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
    allDeadSpecies,
    deadSpecies;

  rootsHierarchy = recTreeVisu._computeHierarchy(rootsClades);

  gnTreesAppendices = findGnTreesAppendices(rootsHierarchy.rootsRecGnTrees);

  allDeadSpecies = createDeadSpeciesFromGnTreesAppendices(gnTreesAppendices);

  deadSpecies = mergeDeadSpecies(allDeadSpecies);

  addDeadSpecies(rootsClades.rootSpTree, deadSpecies);

  giveSpeciesLocations(rootsClades, gnTreesAppendices);

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

function createDeadSpeciesFromGnTreesAppendices (gnTreesAppendices) {
  var gnTreeAppendices;
  var appendicesSpTree = [];

  for (gnTreeAppendices of gnTreesAppendices) {
    appendicesSpTree.push(createAppendiceSpTreeFromGnTreeOut(gnTreeAppendices));
  }
  gnTreesAppendices = _.flatten(appendicesSpTree);
  return gnTreesAppendices;
}

// Compare les nouveaux appendices de l'arbre de espèces et les fusionnes pour éviter les doublons out.
function mergeDeadSpecies (deadSpecies) {
  var concernSpecies, cs, rootsAppendice;
  var keepSpecies = [];

  concernSpecies = deadSpecies.map(function (ds) {
    return ds.sourceSpecies;
  });
  concernSpecies = _.uniq(concernSpecies);

  for (cs of concernSpecies) {
    rootsAppendice = deadSpecies.filter(function (ds) {
      return ds.sourceSpecies === cs;
    });
    keepSpecies.push(keepBiggerTree(rootsAppendice));
  }
  return keepSpecies;
}

// TODO: FAUX
// Pour l'instant la fonction prend l'arbre le plus grand, ce n'est pas la bonne méthode il faudrai fusionner les arbres.
function keepBiggerTree (rootsAppendice) {
  var maxLength = 0;
  var result, lengthDescendants;
  for (var tree of rootsAppendice) {
    tree = d3.hierarchy(tree, function (node) {
      return node.clade;
    });
    lengthDescendants = tree.descendants().length;
    if (lengthDescendants > maxLength) {
      result = tree.data;
    }
  }

  return result;
}

// AJOUTER les deadSpecies à l'arbres des espèces
// LEur donner un nom pour les identifiers et référencer dans l'arbre de gènes
function addDeadSpecies (rootSpTree, deadSpecies) {
  var hierarchyDs;
  var sourceSpecies;
  var i = 0;
  var ds;

  // Donne un nom à chaque nouvelle espèces
  for (ds of deadSpecies) {
    sourceSpecies = ds.sourceSpecies;
    hierarchyDs = d3.hierarchy(ds, function (node) {
      return node.clade;
    });
    hierarchyDs.each(function (node) {
      node.data.name = sourceSpecies + '_' + ++i;
      delete node.data['eventsRec'];
    });
    i = 0;
  }

  // Rajoute les espèces nouvelles à l'abre des espèces
  rootSpTree = putAppendicesInSpTree(deadSpecies, rootSpTree);
  return rootSpTree;
}

function createAppendiceSpTreeFromGnTreeOut (gnTreeAppendice) {
  var rootAppendice,
    rootSpTree,
    clade;

  rootAppendice = d3.hierarchy(gnTreeAppendice, function (node) {
    return node.clade;
  });

  // TODO: FAUX
  // L'élement data n'est pas une copy en profondeur!
  rootSpTree = rootAppendice.copy();

  // TODO: FAUX
  rootSpTree.each(function (node) {
    clade = node.data;
    if (clade.eventsRec[0].eventType === 'transferBack') {
      delete clade['clade'];
    }
  });

  return rootSpTree.data;
}

// Ajouter dans l'arbre des espèces
function putAppendicesInSpTree (deadSpecies, rootSpTree) {
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

function giveSpeciesLocations (rootsClades, deadSpecies) {
  var recTree;
  recTree = recTreeVisu._computeHierarchy(rootsClades);
  console.log(recTree);
  console.log(deadSpecies);
}
