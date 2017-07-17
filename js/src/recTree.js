/**
 * @Author: Guillaume GENCE <guigen>
 * @Date:   2017-07-05T15:05:19+02:00
 * @Email:  guillaume.gence@univ-lyon1.fr
 * @Last modified by:   guigen
 * @Last modified time: 2017-07-05T16:30:30+02:00
 */

recTreeVisu = {};

recTreeVisu.vizualize = function (recPhyloXML,domContainerId) {
  var recTree;
  //Parse le recPhyloXML, créer les branches mortes et stock dans un objet de type recTree
  recTree = recTreeVisu.process(recPhyloXML);
  //Calcul la position des elements de recTree (noueds, branches) dans un repère en 2 dimensions
  // recTreeVisu.map(recTree);
  // //Genere le svg dans le container domContainerId
  // recTreeVisu.render(recTree,domContainerId);
}
