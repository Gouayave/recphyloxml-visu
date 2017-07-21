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
