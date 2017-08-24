/**
 * @Author: Guillaume GENCE <gence>
 * @Date:   2017-07-12T10:22:26+02:00
 * @Email:  guillaume.gence@univ-lyon1.fr
 * @Last modif ied by:   gence
 * @Last modif ied time: 2017-07-12T14:27:09+02:00
 */

// Source : https://stackoverflow.com/questions/4200913/xml-to-javascript-object#19448718
recTreeVisu.parseRecPhyloXML = function(xml) {
    var dom = null;
    var objRecPhyloXML = {};
    var error = {};
    var arrayTags = ['clade', 'recGeneTree'];

    if (window.DOMParser) {
        dom = (new DOMParser()).parseFromString(xml, 'text/xml');
    } else if (window.ActiveXObject) {
        dom = new ActiveXObject('Microsoft.XMLDOM');
        dom.async = false;
        if (!dom.loadXML(xml)) {
            error.msg = dom.parseError.reason + ' ' + dom.parseError.srcText;
            throw error;
        }
    } else {
        error.msg = 'cannot parse xml string!';
        throw error;
    }

    function isArray(o) {
        return Object.prototype.toString.apply(o) === '[object Array]';
    }

    function parseNode(xmlNode, objRecPhyloXML, xmlNodeParent) {
        var length;
        var i;

        if (xmlNodeParent.nodeName === 'name') {
            objRecPhyloXML['value'] = xmlNode.nodeValue;
            return;
        }

        if (xmlNode.nodeName === '#text' && xmlNode.nodeValue.trim() === '') {
            return;
        }

        var jsonNode = {};
        var existing = objRecPhyloXML[xmlNode.nodeName];

        if (xmlNodeParent.nodeName !== 'eventsRec') {
            if (existing) {
                if (!isArray(existing)) {
                    objRecPhyloXML[xmlNode.nodeName] = [existing, jsonNode];
                } else {
                    objRecPhyloXML[xmlNode.nodeName].push(jsonNode);
                }
            } else {
                if (arrayTags && arrayTags.indexOf(xmlNode.nodeName) !== -1) {
                    objRecPhyloXML[xmlNode.nodeName] = [jsonNode];
                } else {
                    objRecPhyloXML[xmlNode.nodeName] = jsonNode;
                }
            }
        }

        if (xmlNode.attributes) {
            length = xmlNode.attributes.length;
            for (i = 0; i < length; i++) {
                var attribute = xmlNode.attributes[i];
                jsonNode[attribute.nodeName] = attribute.nodeValue;
            }
        }

        if (xmlNode.nodeName === 'eventsRec') {
            jsonNode.listEvents = [];
        }

        if (xmlNodeParent.nodeName === 'eventsRec') {
            var name = xmlNode.nodeName;
            var obj = {
                name: name,
                attr: jsonNode
            };
            objRecPhyloXML.listEvents.push(obj);
        }

        length = xmlNode.childNodes.length;
        // Rajout perso

        for (i = 0; i < length; i++) {
            parseNode(xmlNode.childNodes[i], jsonNode, xmlNode);
        }
    }

    if (dom.childNodes.length) {
        parseNode(dom.childNodes[0], objRecPhyloXML, {});
    }

    // assert
    if (!objRecPhyloXML.recPhylo) {
        window.alert('Error during parse recPhyloXML.');
        error.msg = 'Error during parse recPhyloXML.';
        throw error;
    }

    objRecPhyloXML = _getRootsClades(objRecPhyloXML);
    _formatWithoutListEvents(objRecPhyloXML);

    return objRecPhyloXML;
};

// On récupére les clades racines des arbres
function _getRootsClades(objRecPhyloXML) {
    var rootsClades = {};
    var i = 0;

    // Get clades Root
    rootsClades.rootSpTree = _.get(objRecPhyloXML, 'recPhylo.spTree.phylogeny.clade[0]');

    if (!rootsClades.rootSpTree) {
        throw "There is no spTree in your recphyloXML"
    }

    rootsClades.rootsRecGnTrees = _.map(_.get(objRecPhyloXML, 'recPhylo.recGeneTree'), (phylogeny) => {
        var root = _.get(phylogeny, 'phylogeny.clade[0]');
        root.idTree = ++i;
        return root;
    });

    return rootsClades;
}

// Correction des elements nouveaux lors du parsage inutiles lors du parsage du xml
function _formatWithoutListEvents(objRecPhyloXML) {
    var rootsHierarchy,
        rootsRecGnTrees,
        rootSpTree,
        nodes,
        listEvents,
        name,
        clade;

    rootsHierarchy = recTreeVisu._computeHierarchy(objRecPhyloXML);

    // Dans l'arbre des espèces
    rootSpTree = rootsHierarchy.rootSpTree;
    nodes = rootSpTree.descendants();
    for (var node of nodes) {
        clade = node.data;
        // On enlève le name value et on le met dans le name
        name = clade.name.value;
        clade.name = name;
        // On enlève les #comment
        delete clade['#comment'];
    }

    // Dans les arbres de gènes
    rootsRecGnTrees = rootsHierarchy.rootsRecGnTrees;
    for (var rootRecGnTrees of rootsRecGnTrees) {
        nodes = rootRecGnTrees.descendants();
        for (node of nodes) {
            clade = node.data;
            // On enlève le listEvents
            listEvents = clade.eventsRec.listEvents;
            clade.eventsRec = listEvents;
            // On format le recEvent
            for (var ev of listEvents) {
                ev.eventType = ev.name;
                delete ev['name'];

                if (ev.attr && ev.attr.speciesLocation) {
                    ev.speciesLocation = ev.attr.speciesLocation;
                }

                if (ev.attr && ev.attr.destinationSpecies) {
                    ev.destinationSpecies = ev.attr.destinationSpecies;
                }

                if (ev.attr && ev.attr.geneName) {
                    ev.geneName = ev.attr.geneName;
                }
                delete ev['attr'];
            }

            // On enlève le name value et on le met dans le name
            name = clade.name.value;
            clade.name = name;
            // On enlève les #comment
            delete clade['#comment'];
        }
    }
}

// Compute hierarchy data
recTreeVisu._computeHierarchy = function(rootsClades) {
    var rootsHierarchy = {};
    var idTree = 0;

    // Compute D3 hierarchical layout
    function returnClade(d) {
        return d.clade;
    }

    rootsHierarchy.rootSpTree = d3.hierarchy(rootsClades.rootSpTree, returnClade);
    // Add position child from his parent for futur use
    rootsHierarchy.rootSpTree.each(function(d) {
        if (d.children && d.children[0]) {
            d.children[0].data.posChild = 0;
        }

        if (d.children && d.children[1]) {
            d.children[1].data.posChild = 1;
        }

        if (d.parent) {
            d.data.posParent = d.parent.data.posChild;
        }

    });

    rootsHierarchy.rootsRecGnTrees = _.map(rootsClades.rootsRecGnTrees, (root) => {
        var rootRecGnTrees = d3.hierarchy(root, returnClade);
        idTree++;
        rootRecGnTrees.each(function(d) {
            d.data.idTree = idTree;
            if (d.children && d.children[0]) {
                d.children[0].data.posChild = 0;
            }

            if (d.children && d.children[1]) {
                d.children[1].data.posChild = 1;
            }
        });
        return rootRecGnTrees;
    });

    return rootsHierarchy;
};