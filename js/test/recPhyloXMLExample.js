/**
 * @Author: Guillaume GENCE <guigen>
 * @Date:   2017-07-05T11:35:11+02:00
 * @Email:  guillaume.gence@univ-lyon1.fr
 * @Last modified by:   guigen
 * @Last modified time: 2017-07-05T14:25:59+02:00
 */

var exampleXML = `
<recPhylo  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
 xmlns="http://phylariane.univ-lyon1.fr/recphyloxml"
 xsi:schemaLocation="./recPhyloXML.xsd">
  <spTree>
    <phylogeny>
      <clade>
        <name>1</name>
        <clade>
          <name>2</name>
        </clade>
        <clade>
          <name>3</name>
          <clade>
            <name>4</name>
          </clade>
          <clade>
            <name>5</name>
          </clade>
        </clade>
      </clade>
    </phylogeny>
  </spTree>
  <recGeneTree>
    <phylogeny rooted="true">
      <clade>
        <name>a</name>
        <eventsRec>
          <leaf speciesLocation="2"></leaf>
        </eventsRec>
      </clade>
    </phylogeny>
  </recGeneTree>
</recPhylo>
`




var exampleXML = `
<recPhylo  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
 xmlns="http://phylariane.univ-lyon1.fr/recphyloxml"
 xsi:schemaLocation="./recPhyloXML.xsd">
  <spTree>
    <phylogeny>
      <clade>
        <name>13</name>
        <clade>
          <name>12</name>
          <clade>
            <name>10</name>
            <clade>
              <name>1</name>
            </clade>
            <clade>
              <name>8</name>
              <clade>
                <name>2</name>
              </clade>
              <clade>
                <name>3</name>
              </clade>
            </clade>
          </clade>
          <clade>
            <name>9</name>
            <clade>
              <name>4</name>
            </clade>
            <clade>
              <name>5</name>
            </clade>
          </clade>
        </clade>
        <clade>
          <name>11</name>
          <clade>
            <name>6</name>
          </clade>
          <clade>
            <name>7</name>
          </clade>
        </clade>
      </clade>
    </phylogeny>
</spTree>
  <recGeneTree>
    <phylogeny rooted="true">
      <clade>
        <name>a</name>
        <eventsRec>
          <speciation speciesLocation="11"></speciation>
        </eventsRec>
        <clade>
          <name>n</name>
          <eventsRec>
            <leaf speciesLocation="7"></leaf>
          </eventsRec>
        </clade>
        <clade>
          <name>b</name>
          <eventsRec>
            <speciationOutLoss speciesLocation="6"></speciationOutLoss>
            <bifurcationOut></bifurcationOut>
          </eventsRec>
          <!--Enfant droit de b -->
          <clade>
            <name>c</name>
            <eventsRec>
              <transferBack destinationSpecies="5"></transferBack>
              <speciationOut speciesLocation="5"></speciationOut>
            </eventsRec>
            <clade>
              <name>l</name>
              <eventsRec>
                <leaf speciesLocation="5"></leaf>
              </eventsRec>
            </clade>
            <clade>
              <name>k</name>
              <eventsRec>
                <transferBack destinationSpecies="4"></transferBack>
                <leaf speciesLocation="4"></leaf>
              </eventsRec>
            </clade>
          </clade>
          <!--Enfant gauche de b -->
          <clade>
            <name>d</name>
            <eventsRec>
              <transferBack destinationSpecies="10"></transferBack>
              <speciation speciesLocation="10"></speciation>
            </eventsRec>
            <clade>
              <name>e</name>
              <eventsRec>
                <duplication speciesLocation="8"></duplication>
              </eventsRec>
              <!--Enfant droit de e -->
              <clade>
                <name>h</name>
                <eventsRec>
                  <speciationLoss speciesLocation="8"></speciationLoss>
                  <leaf speciesLocation="2"></leaf>
                </eventsRec>
              </clade>
              <!--Enfant gauche de e -->
              <clade>
                <name>f</name>
                <eventsRec>
                  <speciation speciesLocation="8"></speciation>
                </eventsRec>
                <clade>
                  <name>j</name>
                  <eventsRec>
                    <leaf speciesLocation="3"></leaf>
                  </eventsRec>
                </clade>
                <clade>
                  <name>i</name>
                  <eventsRec>
                    <leaf speciesLocation="2"></leaf>
                  </eventsRec>
                </clade>
              </clade>
            </clade>
            <clade>
              <name>g</name>
              <eventsRec>
                <leaf speciesLocation="1"></leaf>
              </eventsRec>
            </clade>
          </clade>
        </clade>
      </clade>
    </phylogeny>
  </recGeneTree>
  <recGeneTree>
    <phylogeny rooted="true">
      <clade>
        <name>a</name>
        <eventsRec>
          <speciation speciesLocation="11"></speciation>
        </eventsRec>
        <clade>
          <name>n</name>
          <eventsRec>
            <leaf speciesLocation="7"></leaf>
          </eventsRec>
        </clade>
        <clade>
          <name>b</name>
          <eventsRec>
            <speciationOutLoss speciesLocation="6"></speciationOutLoss>
            <bifurcationOut></bifurcationOut>
          </eventsRec>
          <!--Enfant droit de b -->
          <clade>
            <name>c</name>
            <eventsRec>
              <transferBack destinationSpecies="5"></transferBack>
              <speciationOut speciesLocation="5"></speciationOut>
            </eventsRec>
            <clade>
              <name>l</name>
              <eventsRec>
                <leaf speciesLocation="5"></leaf>
              </eventsRec>
            </clade>
            <clade>
              <name>k</name>
              <eventsRec>
                <transferBack destinationSpecies="4"></transferBack>
                <leaf speciesLocation="4"></leaf>
              </eventsRec>
            </clade>
          </clade>
          <!--Enfant gauche de b -->
          <clade>
            <name>d</name>
            <eventsRec>
              <transferBack destinationSpecies="10"></transferBack>
              <speciation speciesLocation="10"></speciation>
            </eventsRec>
            <clade>
              <name>e</name>
              <eventsRec>
                <duplication speciesLocation="8"></duplication>
              </eventsRec>
              <!--Enfant droit de e -->
              <clade>
                <name>h</name>
                <eventsRec>
                  <speciationLoss speciesLocation="8"></speciationLoss>
                  <leaf speciesLocation="2"></leaf>
                </eventsRec>
              </clade>
              <!--Enfant gauche de e -->
              <clade>
                <name>f</name>
                <eventsRec>
                  <speciation speciesLocation="8"></speciation>
                </eventsRec>
                <clade>
                  <name>j</name>
                  <eventsRec>
                    <leaf speciesLocation="3"></leaf>
                  </eventsRec>
                </clade>
                <clade>
                  <name>i</name>
                  <eventsRec>
                    <leaf speciesLocation="2"></leaf>
                  </eventsRec>
                </clade>
              </clade>
            </clade>
            <clade>
              <name>g</name>
              <eventsRec>
                <leaf speciesLocation="1"></leaf>
              </eventsRec>
            </clade>
          </clade>
        </clade>
      </clade>
    </phylogeny>
  </recGeneTree>

</recPhylo>
`
