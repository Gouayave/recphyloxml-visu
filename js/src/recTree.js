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
  // Calcul la position des elements de recTree (noueds, branches) dans un repère en 2 dimensions
  recTrees = recTreeVisu.map(rootsClades);
  // //Genere le svg dans le container domContainerId
  recTreeVisu.render(recTrees, domContainerId);
};
