var exports = module.exports = {};
exports.reconcile = reconcile;

var d3hierarchy = require('d3-hierarchy');


//Associate species location to loss node
function reconcile(rootCladeGenesTree, rootCladeSpeciesTree) {

  //Get all loss gene leaf a species location
  var rootNodeGt = d3hierarchy.hierarchy(rootCladeGenesTree,function (d) {
    return d.clade;
  });
  var rootNodeSt = d3hierarchy.hierarchy(rootCladeSpeciesTree,function (d) {
    return d.clade;
  });

  var nodesGt = rootNodeGt.descendants();
  var nodesSt = rootNodeSt.descendants();

  // Manage nodes with speciationLoss
  var nodesSpeciationsWithSpeciationLossGt = nodesGt.filter(function (n) {
    return n.data.eventsRec[0].eventType == "speciationLoss";
  });

  var nodesSpeciationsWithLossMatchSt = [];
  for (n of nodesSpeciationsWithSpeciationLossGt) {
    nodesSpeciationsWithLossMatchSt.push(findCladeInSpeciesTree(n.data.eventsRec[0].speciesLocation, nodesSt));
  }

  //Assert
  if(! nodesSpeciationsWithSpeciationLossGt.length == nodesSpeciationsWithLossMatchSt.length)
  {
    throw "Number of loss in genesTree is different than number of speciationLoss in speciesTree"
  }

  for (var i = 0; i < nodesSpeciationsWithSpeciationLossGt.length; i++) {
    giveSpeciesLocationToGeneLoss(nodesSpeciationsWithSpeciationLossGt[i].data,nodesSpeciationsWithLossMatchSt[i].data);
  }

}

//Rechercher un clade par son nom dans l'arbre des espèces
function findCladeInSpeciesTree(speciesLocation, nodesSt) {

  var clade = nodesSt.find(function (n) {
    return n.data.name == speciesLocation;
  });

  //Assert
  if(!clade)
    throw "There is a mismatch in reconcile method; spLocation : " + speciesLocation.toString();

  return clade;
}

//Attribut une 'speciesLocation' au gène Loss
function giveSpeciesLocationToGeneLoss(cladeGt, cladeSt) {


  var indexLostCladeGt = cladeGt.clade.findIndex(function (child) {
    return child.eventsRec[0].speciesLocation == "undefined";
  });

  var indexNotLostCladeGt = cladeGt.clade.findIndex(function (child) {
    return child.eventsRec[0].speciesLocation != "undefined";
  });

  //assert
  if(indexLostCladeGt == -1 || indexNotLostCladeGt == -1)
    throw "Can't find speciesLocation of gene loss in reconcile method";

  var lostCladeSt = cladeSt.clade.find(function (child) {
    return child.name != cladeGt.clade[indexNotLostCladeGt].eventsRec[0].speciesLocation;
  });

  cladeGt.clade[indexLostCladeGt].eventsRec[0].speciesLocation = lostCladeSt.name;
}
