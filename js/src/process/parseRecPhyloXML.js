/**
 * @Author: Guillaume GENCE <gence>
 * @Date:   2017-07-12T10:22:26+02:00
 * @Email:  guillaume.gence@univ-lyon1.fr
 * @Last modified by:   gence
 * @Last modified time: 2017-07-12T14:27:09+02:00
 */


 /* Source : https://stackoverflow.com/questions/4200913/xml-to-javascript-object#19448718*/
function _parseRecPhyloXML (xml, arrayTags)
{
    var dom = null;
    var objRecPhyloXML = {};


    if (window.DOMParser)
    {
        dom = (new DOMParser()).parseFromString(xml, "text/xml");
    }
    else if (window.ActiveXObject)
    {
        dom = new ActiveXObject('Microsoft.XMLDOM');
        dom.async = false;
        if (!dom.loadXML(xml))
        {
            throw dom.parseError.reason + " " + dom.parseError.srcText;
        }
    }
    else
    {
        throw "cannot parse xml string!";
    }

    function isArray(o)
    {
        return Object.prototype.toString.apply(o) === '[object Array]';
    }

    function parseNode(xmlNode, objRecPhyloXML, xmlNodeParent)
    {

        if(xmlNodeParent.nodeName == "name"){
          objRecPhyloXML["value"] =  xmlNode.nodeValue;
          return
        }


        if(xmlNode.nodeName == "#text" && xmlNode.nodeValue.trim() == "")
        {
            return ;
        }

        var jsonNode = {};
        var existing = objRecPhyloXML[xmlNode.nodeName];

        if(xmlNodeParent.nodeName !== "eventsRec"){
          if(existing)
          {
              if(!isArray(existing))
              {
                  objRecPhyloXML[xmlNode.nodeName] = [existing, jsonNode];
              }
              else
              {
                  objRecPhyloXML[xmlNode.nodeName].push(jsonNode);
              }
          }
          else
          {
              if(arrayTags && arrayTags.indexOf(xmlNode.nodeName) != -1)
              {
                  objRecPhyloXML[xmlNode.nodeName] = [jsonNode];
              }
              else
              {
                  objRecPhyloXML[xmlNode.nodeName] = jsonNode;
              }
          }
        }



        if(xmlNode.attributes)
        {
            var length = xmlNode.attributes.length;
            for(var i = 0; i < length; i++)
            {
                var attribute = xmlNode.attributes[i];
                jsonNode[attribute.nodeName] = attribute.nodeValue;
            }
        }

        if(xmlNode.nodeName === "eventsRec"){
          jsonNode.listEvents = [];
        }

        if(xmlNodeParent.nodeName === "eventsRec"){
          var name = xmlNode.nodeName;
          var obj = {
            name : name,
            attr : jsonNode
          };
          objRecPhyloXML.listEvents.push(obj)
        }

        var length = xmlNode.childNodes.length;
        // Rajout perso
        for(var i = 0; i < length; i++)
        {
          parseNode(xmlNode.childNodes[i], jsonNode, xmlNode );
        }
    }

    if(dom.childNodes.length)
    {
        parseNode(dom.childNodes[0], objRecPhyloXML , {});
    }

    // assert
    if(!objRecPhyloXML.recPhylo){
      console.error(parsedXml);
      alert("Error during parse recPhyloXML.");
      throw "Error during parse recPhyloXML."
    }

    objRecPhyloXML = _getRootsClades(objRecPhyloXML);
    _formatWithoutListEvents(objRecPhyloXML);

    return objRecPhyloXML;
}

//On récupére les clades racines des arbres
function _getRootsClades (objRecPhyloXML) {

  var rootsClades = {};

  // Get clades Root
  rootsClades.rootSpTree = _.get(objRecPhyloXML, 'recPhylo.spTree.phylogeny.clade[0]');
  rootsClades.rootsRecGnTrees = _.map(_.get(objRecPhyloXML, 'recPhylo.recGeneTree'), (phylogeny) => {
    return _.get(phylogeny, 'phylogeny.clade[0]');
  });

  return rootsClades;

}

//Correction des elements nouveaux lors du parsage inutiles lors du parsage du xml
function _formatWithoutListEvents(objRecPhyloXML) {

  var rootsHierarchy,
      rootsRecGnTrees,
      rootSpTree,
      nodes,
      listEvents,
      name,
      clade;

  rootsHierarchy = _computeHierarchy(objRecPhyloXML);

  // Dans l'arbre des espèces
  rootSpTree = rootsHierarchy.rootSpTree;
  nodes = rootSpTree.descendants();
  for (node of nodes) {
    clade = node.data;
    //On enlève le name value et on le met dans le name
    name = clade.name.value;
    clade.name = name;
    //On enlève les #comment
    delete clade['#comment'];
  }

  // Dans les arbres de gènes
  rootsRecGnTrees = rootsHierarchy.rootsRecGnTrees;
  for (rootRecGnTrees of rootsRecGnTrees) {
    nodes = rootRecGnTrees.descendants();
    for (node of nodes) {
      clade = node.data;
      //On enlève le listEvents
      listEvents = clade.eventsRec.listEvents;
      clade.eventsRec = listEvents;
      //On format le recEvent
      for (ev of listEvents) {

        ev.eventType = ev.name;
        delete ev["name"];

        if(ev.attr && ev.attr.speciesLocation){
          ev.speciesLocation = ev.attr.speciesLocation;
        }

        if(ev.attr && ev.attr.destinationSpecies){
          ev.destinationSpecies = ev.attr.destinationSpecies;
        }
        delete ev["attr"]

      }

      //On enlève le name value et on le met dans le name
      name = clade.name.value;
      clade.name = name;
      //On enlève les #comment
      delete clade['#comment'];
    }
  }
}


//Compute hierarchy data
function _computeHierarchy(rootsClades) {

  var rootsHierarchy = {};

  // Compute D3 hierarchical layout
  function returnClade(d) {
    return d.clade;
  }

  rootsHierarchy.rootSpTree = d3.hierarchy(rootsClades.rootSpTree,returnClade);
  //Add position child from his parent for futur use
  rootsHierarchy.rootSpTree.each(function (d) {

    if (d.children && d.children[0]) {
      d.children[0].posChild = 0;
    }

    if(d.children && d.children[1]){
      d.children[1].posChild = 1;
    }
  });

  rootsHierarchy.rootsRecGnTrees = _.map(rootsClades.rootsRecGnTrees,(root) => {
    var rootRecGnTrees = d3.hierarchy(root,returnClade);
    rootRecGnTrees.each(function (d) {

      if (d.children && d.children[0]) {
        d.children[0].posChild = 0;
      }

      if(d.children && d.children[1]){
        d.children[1].posChild = 1;
      }
    });
    return rootRecGnTrees;
  });

  return rootsHierarchy;
}
