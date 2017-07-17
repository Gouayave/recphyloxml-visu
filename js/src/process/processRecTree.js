/**
 * @Author: Guillaume GENCE <guigen>
 * @Date:   2017-07-05T14:11:52+02:00
 * @Email:  guillaume.gence@univ-lyon1.fr
 * @Last modified by:   gence
 * @Last modified time: 2017-07-12T14:27:04+02:00
 */

recTreeVisu.process = function (recPhyloXML) {
  var objRecPhyloXML,
      rootsClades,
      rootsHierarchy;

  rootsClades = _parseRecPhyloXML(recPhyloXML,["clade","recGeneTree"]);

  rootsClades = _flatTrees(rootsClades)
  console.log(
   treeify.asTree(rootsClades.rootsRecGnTrees[0], true)
  );


  // console.log(  treeify.asTree(rootsClades.rootsRecGnTrees[0],true));
  // rootsHierarchy = _mergeTreesAndHierarchy(rootsClades);

  return rootsHierarchy;
}
