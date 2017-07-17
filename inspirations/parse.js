var exports = module.exports = {};
exports.parse = parse;

var xml_digester = require("xml-digester");

var handler = new xml_digester.OrderedElementsHandler("eventType");
var options = {
  "handler": [{
    "path": "eventsRec/*",
    "handler": handler
  }]
};
var digester = xml_digester.XmlDigester(options);

function parse(xmlstr,callback) {
  //Silent
  var cl = console.log;
  console.log = function (str) {};
  digester.digest(xmlstr, function (err,recTree) {
    //Talk
    console.log = cl;
    //We want array for recGeneTrees
    if(recTree.recPhylo)
    {
      var recGeneTrees = recTree.recPhylo.recGeneTree;
      if( !recGeneTrees.length){
        recTree.recPhylo.recGeneTree = [recGeneTrees];
      }
    }

    //We always want recPhylo
    if(recTree.recGeneTree)
    {
      recTree.recPhylo = {};
      recTree.recPhylo.recGeneTree = [recTree.recGeneTree];
      delete recTree.recGeneTree;
    }

    callback(err,recTree);
  });
}
