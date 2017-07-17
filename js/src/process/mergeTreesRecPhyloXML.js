/**
 * @Author: Guillaume GENCE <gence>
 * @Date:   2017-07-12T14:25:18+02:00
 * @Email:  guillaume.gence@univ-lyon1.fr
 * @Last modified by:   gence
 * @Last modified time: 2017-07-13T11:25:11+02:00
 */



 //TODO:
 // -Doit ajouter et signaler si une branche de l'arbre des espèces est une branche "espèce eteinte"
 // -Doit renseigner les nombre de genes contenue dans chaque espèces
 // -Doit renseigner le nombre d'evenement survenues dans une espèces
 function _mergeTreesAndHierarchy (rootsClades) {

   var rootsHierarchy;

   //1- Parcourir et ajouter les espèces mortes de type speciationOut
   rootsClades = _addSpOutSpeciesInSpTree(rootsClades)
   //3- Parcourir et donner les nbs de gènes par espèces et le nb d'evnement
   rootsHierarchy = _reportGnStoriesToSpContainers(rootsClades)

   return rootsHierarchy;

 }

 //1-A Ajouter les espèces mortes de type speciationOut
 function _addSpOutSpeciesInSpTree(rootsClades) {

   var rootsHierarchy,
       speciesNamesWithSpOut = [],
       speciesArray,
       genesArray,
       outGenes = [];
       SpTreesOut = [];

   rootsHierarchy = _computeHierarchy(rootsClades);

   speciesArray = rootsHierarchy.rootSpTree.descendants();

   for (rootRecGnTrees of rootsHierarchy.rootsRecGnTrees) {
     genesArray = rootRecGnTrees.descendants();
     outGenes = _findSpOutGenes(genesArray);
     //Retourn un tableau de portion d'arbre des espèces à rajouter dans l'arbre actuelle
     SpTreesOut = _buildSpTreesOut(outGenes,SpTreesOut);

    //  speciesNamesWithSpOut = _.concat(speciesNamesWithSpOut, outGenes);
   }

  //  speciesNamesWithSpOut = _.uniq(speciesNamesWithSpOut);
  //  _addDeadCladeFromSpOut(speciesNamesWithSpOut,speciesArray);

   return rootsClades;
 }

//Retourn un tableau de portion d'arbre des espèces à rajouter dans l'arbre actuelle
// retour de type
// [{
//   position : "6",
//   root : { clade : ..}
// }, ..]
function _buildSpTreesOut(outGenes,SpTreesOut) {

  var tree;

  // Pour chaque outGene
  for (outGene of outGenes) {
    //On construit le sous arbre à partir de la liste d'évènements
    tree = _buildTreeFromEvents(outGene)

    //On vérifie qu'il n'y a pas déjà l'arbre dans ceux construit, Sinon on garde le plus complet (ou on merge les deux ???)
    SpTreesOut = _isTreeExist(tree,SpTreesOut)
  }

  return SpTreesOut;
}

//TODO:
//On construit le sous arbre à partir de la liste d'évènements
function _buildTreeFromEvents(outGene) {
  var gene,
      eventsRec,
      posSpOut;

  gene = outGene.gene.data;
  posSpOut = outGene.index;
  eventsRec = gene.eventsRec.slice(posSpOut);

  return {};
}

//TODO:
//On vérifie qu'il n'y a pas déjà l'arbre dans ceux construit, Sinon on garde le plus complet (ou on merge les deux ???)
function _isTreeExist(tree,SpTreesOut) {
  return SpTreesOut;
}

 //1-B Ajout des clades morts dans l'arbre des espèces
 function _addDeadCladeFromSpOut(speciesNamesWithSpOut,speciesArray) {

   var speciesWithSpOut;

   speciesWithSpOut = speciesNamesWithSpOut.map(function (speciesNameWithSpOut) {
     var species = _findSpeciesByName(speciesArray,speciesNameWithSpOut);

     // Assert
     var msg = speciesNameWithSpOut + " is in geneTree but not in Species Tree";
     proclaim.ok( species, msg );

     return species;
   });

   for (spWithSpOut of speciesWithSpOut) {
     _addDeadSpChildInSp(spWithSpOut);
   }
 }

 //1-C Création et positionnement de clade
 function _addDeadSpChildInSp(sp) {

   var spName,
       intermediateSp = {name:{},clade:[]},
       deadSp = {name:{},clade:[]},
       eventsRecInterSp = [],
       eventsRecDeadSp = [];

   spName = sp.data.name.value;
   intermediateSp.name.value = spName ;
   intermediateSp.spOut = true;
   deadSp.name.value = spName + "_dead";
   deadSp.dead = true;

   intermediateSp.clade.push(deadSp);
   intermediateSp.clade.push(sp.data);

   sp.parent.data.clade[sp.posChild] = intermediateSp;
 }



 //Valider l'arbre des espèces avec chaque abres de gènes
 function _reportGnStoriesToSpContainers(rootsClades) {
     var rootsHierarchy,
         allEvents = [];

     rootsHierarchy = _computeHierarchy(rootsClades);

     //TODO
     //-1 Récupère tout les eventsRec de chaque noueds des arbres de gènes
     allEvents = _getallEvents(rootsHierarchy.rootsRecGnTrees);
     //-2 Pour chaque evenement on déclare à l'arbre des espèces
     _reportEvents(allEvents,rootsClades.rootSpTree);

     return rootsHierarchy;
 }

 // TODO: Récupère tout les eventsRec de chaque noueds des arbres de gènes
 function _getallEvents(rootsRecGnTrees) {
   var allEvents = [];
   var nodes;

   rootsRecGnTrees.map(function (rootRecGnTree) {
     nodes = rootRecGnTree.descendants();
     for (node of nodes) {
         allEvents.push(node.data.eventsRec);
     }
   });

   return allEvents;
 }

 //-TODO: Pour chaque evenement on déclare à l'arbre des espèces
 function _reportEvents(allEvents,rootSpTree) {
   // 1- On identifie la nature de l'evenement (speciationOutLoss, leaf, etc..) et selon sa nature on ajoute incrémente ou décremente le nb de gènes de l'espèces container
   // 2- On fait de meme avec le nombre d'evement par espèces containeur
 }

 //Recherche des espèces par leur nom
 function _findSpeciesByName(speciesArray,name) {

   var speciesFound = speciesArray.find(function (species) {
     return species.data.name.value === name;
   });

   return speciesFound;
 }


 //Recherche dans une tableau de gènes les especès qui ont subit une spéciation en dehors de l'arbre (speciationOut*)
 function _findSpOutGenes(genesArray) {

   var spOutGenes = [];
   for (gene of genesArray) {
     var eventsRec = gene.data.eventsRec;
     eventsRec.forEach(function (ev,index) {
       var name = ev.name;
       if(name === "speciationOut" || name === "speciationOutLoss"){
         spOutGenes.push({
           gene : gene,
           index : index
         });
       }
     })
   }

   return _.uniq(spOutGenes);
 }
