// /**
//  * @Author: Guillaume GENCE <guigen>
//  * @Date:   2017-07-05T11:35:11+02:00
//  * @Email:  guillaume.gence@univ-lyon1.fr
//  * @Last modified by:   guigen
//  * @Last modified time: 2017-07-05T14:25:59+02:00
//  */



var exampleXML = `
<recPhylo  xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
 xmlns="http://phylariane.univ-lyon1.fr/recphyloxml"
 xsi:schemaLocation="./recPhyloXML.xsd">
  <spTree>
  <phylogeny rooted="true">
    <clade>
      <name>56</name>
      <clade>
        <name>54</name>
        <clade>
          <name>4</name>
          <clade>
            <name>0</name>
          </clade>
          <clade>
            <name>3</name>
            <clade>
              <name>1</name>
            </clade>
            <clade>
              <name>2</name>
            </clade>
          </clade>
        </clade>
        <clade>
          <name>53</name>
          <clade>
            <name>5</name>
          </clade>
          <clade>
            <name>52</name>
            <clade>
              <name>28</name>
              <clade>
                <name>6</name>
              </clade>
              <clade>
                <name>27</name>
                <clade>
                  <name>7</name>
                </clade>
                <clade>
                  <name>26</name>
                  <clade>
                    <name>14</name>
                    <clade>
                      <name>8</name>
                    </clade>
                    <clade>
                      <name>13</name>
                      <clade>
                        <name>9</name>
                      </clade>
                      <clade>
                        <name>12</name>
                        <clade>
                          <name>10</name>
                        </clade>
                        <clade>
                          <name>11</name>
                        </clade>
                      </clade>
                    </clade>
                  </clade>
                  <clade>
                    <name>25</name>
                    <clade>
                      <name>19</name>
                      <clade>
                        <name>15</name>
                      </clade>
                      <clade>
                        <name>18</name>
                        <clade>
                          <name>16</name>
                        </clade>
                        <clade>
                          <name>17</name>
                        </clade>
                      </clade>
                    </clade>
                    <clade>
                      <name>24</name>
                      <clade>
                        <name>20</name>
                      </clade>
                      <clade>
                        <name>23</name>
                        <clade>
                          <name>21</name>
                        </clade>
                        <clade>
                          <name>22</name>
                        </clade>
                      </clade>
                    </clade>
                  </clade>
                </clade>
              </clade>
            </clade>
            <clade>
              <name>51</name>
              <clade>
                <name>29</name>
              </clade>
              <clade>
                <name>50</name>
                <clade>
                  <name>40</name>
                  <clade>
                    <name>34</name>
                    <clade>
                      <name>30</name>
                    </clade>
                    <clade>
                      <name>33</name>
                      <clade>
                        <name>31</name>
                      </clade>
                      <clade>
                        <name>32</name>
                      </clade>
                    </clade>
                  </clade>
                  <clade>
                    <name>39</name>
                    <clade>
                      <name>35</name>
                    </clade>
                    <clade>
                      <name>38</name>
                      <clade>
                        <name>36</name>
                      </clade>
                      <clade>
                        <name>37</name>
                      </clade>
                    </clade>
                  </clade>
                </clade>
                <clade>
                  <name>49</name>
                  <clade>
                    <name>41</name>
                  </clade>
                  <clade>
                    <name>48</name>
                    <clade>
                      <name>42</name>
                    </clade>
                    <clade>
                      <name>47</name>
                      <clade>
                        <name>43</name>
                      </clade>
                      <clade>
                        <name>46</name>
                        <clade>
                          <name>44</name>
                        </clade>
                        <clade>
                          <name>45</name>
                        </clade>
                      </clade>
                    </clade>
                  </clade>
                </clade>
              </clade>
            </clade>
          </clade>
        </clade>
      </clade>
      <clade>
        <name>55</name>
      </clade>
    </clade>
  </phylogeny>
  </spTree>
  <recGeneTree>
  <phylogeny rooted="true">
    <id>1</id>
    <clade>
      <name>0</name>
      <eventsRec>
        <speciation speciesLocation="54"></speciation>
      </eventsRec>
      <clade>
        <name>2</name>
        <eventsRec>
          <speciationLoss speciesLocation="4"></speciationLoss>
          <speciationLoss speciesLocation="3"></speciationLoss>
          <leaf speciesLocation="2" geneName="USMAY1_6_PE27"></leaf>
        </eventsRec>
      </clade>
      <clade>
        <name>2</name>
        <eventsRec>
          <speciation speciesLocation="53"></speciation>
        </eventsRec>
        <clade>
          <name>SCHPO_1_PE1919</name>
          <eventsRec>
            <leaf speciesLocation="5" geneName="SCHPO_1_PE1919"></leaf>
          </eventsRec>
        </clade>
        <clade>
          <name>29</name>
          <eventsRec>
            <speciationLoss speciesLocation="52"></speciationLoss>
            <speciation speciesLocation="51"></speciation>
          </eventsRec>
          <clade>
            <name>YALIP1_7_PE5</name>
            <eventsRec>
              <leaf speciesLocation="29" geneName="YALIP1_7_PE5"></leaf>
            </eventsRec>
          </clade>
          <clade>
            <name>8</name>
            <eventsRec>
              <speciation speciesLocation="50"></speciation>
            </eventsRec>
            <clade>
              <name>9</name>
              <eventsRec>
                <speciation speciesLocation="40"></speciation>
              </eventsRec>
              <clade>
                <name>19</name>
                <eventsRec>
                  <speciation speciesLocation="34"></speciation>
                </eventsRec>
                <clade>
                  <name>LACTH_8_PE193</name>
                  <eventsRec>
                    <leaf speciesLocation="30" geneName="LACTH_8_PE193"></leaf>
                  </eventsRec>
                </clade>
                <clade>
                  <name>26</name>
                  <eventsRec>
                    <speciation speciesLocation="33"></speciation>
                  </eventsRec>
                  <clade>
                    <name>KLLAC1_6_PE842</name>
                    <eventsRec>
                      <leaf speciesLocation="32" geneName="KLLAC1_6_PE842"></leaf>
                    </eventsRec>
                  </clade>
                  <clade>
                    <name>ASHGO_6_PE158</name>
                    <eventsRec>
                      <leaf speciesLocation="31" geneName="ASHGO_6_PE158"></leaf>
                    </eventsRec>
                  </clade>
                </clade>
              </clade>
              <clade>
                <name>20</name>
                <eventsRec>
                  <speciation speciesLocation="39"></speciation>
                </eventsRec>
                <clade>
                  <name>ZYGRO_7_PE350</name>
                  <eventsRec>
                    <leaf speciesLocation="35" geneName="ZYGRO_7_PE350"></leaf>
                  </eventsRec>
                </clade>
                <clade>
                  <name>22</name>
                  <eventsRec>
                    <speciation speciesLocation="38"></speciation>
                  </eventsRec>
                  <clade>
                    <name>CAGLA1_8_PE390</name>
                    <eventsRec>
                      <leaf speciesLocation="36" geneName="CAGLA1_8_PE390"></leaf>
                    </eventsRec>
                  </clade>
                  <clade>
                    <name>YEAST_XVXVI_PE94</name>
                    <eventsRec>
                      <leaf speciesLocation="37" geneName="YEAST_XVXVI_PE94"></leaf>
                    </eventsRec>
                  </clade>
                </clade>
              </clade>
            </clade>
            <clade>
              <name>10</name>
              <eventsRec>
                <speciation speciesLocation="49"></speciation>
              </eventsRec>
              <clade>
                <name>PICPG_1_PE1495</name>
                <eventsRec>
                  <leaf speciesLocation="41" geneName="PICPG_1_PE1495"></leaf>
                </eventsRec>
              </clade>
              <clade>
                <name>12</name>
                <eventsRec>
                  <speciation speciesLocation="48"></speciation>
                </eventsRec>
                <clade>
                  <name>DEHAN1_5_PE65</name>
                  <eventsRec>
                    <leaf speciesLocation="42" geneName="DEHAN1_5_PE65"></leaf>
                  </eventsRec>
                </clade>
                <clade>
                  <name>14</name>
                  <eventsRec>
                    <speciation speciesLocation="47"></speciation>
                  </eventsRec>
                  <clade>
                    <name>PISTI1_3_PE586</name>
                    <eventsRec>
                      <leaf speciesLocation="43" geneName="PISTI1_3_PE586"></leaf>
                    </eventsRec>
                  </clade>
                  <clade>
                    <name>16</name>
                    <eventsRec>
                      <speciation speciesLocation="46"></speciation>
                    </eventsRec>
                    <clade>
                      <name>CANDC_3_PE246</name>
                      <eventsRec>
                        <leaf speciesLocation="44" geneName="CANDC_3_PE246"></leaf>
                      </eventsRec>
                    </clade>
                    <clade>
                      <name>CANAW_4_PE230</name>
                      <eventsRec>
                        <leaf speciesLocation="45" geneName="CANAW_4_PE230"></leaf>
                      </eventsRec>
                    </clade>
                  </clade>
                </clade>
              </clade>
            </clade>
          </clade>
        </clade>
      </clade>
    </clade>
  </phylogeny>
  </recGeneTree>
  <recGeneTree>
    <phylogeny rooted="true">
      <id>0</id>
      <clade>
        <name>0</name>
        <eventsRec>
          <speciation speciesLocation="52"></speciation>
        </eventsRec>
        <clade>
          <name>22</name>
          <eventsRec>
            <speciationLoss speciesLocation="28"></speciationLoss>
            <speciation speciesLocation="27"></speciation>
          </eventsRec>
          <clade>
            <name>PENCW_16_PE1536</name>
            <eventsRec>
              <leaf speciesLocation="7" geneName="PENCW_16_PE1536"></leaf>
            </eventsRec>
          </clade>
          <clade>
            <name>31</name>
            <eventsRec>
              <speciation speciesLocation="26"></speciation>
            </eventsRec>
            <clade>
              <name>32</name>
              <eventsRec>
                <speciation speciesLocation="25"></speciation>
              </eventsRec>
              <clade>
                <name>40</name>
                <eventsRec>
                  <speciation speciesLocation="24"></speciation>
                </eventsRec>
                <clade>
                  <name>EMENI_39_PE1012</name>
                  <eventsRec>
                    <leaf speciesLocation="20" geneName="EMENI_39_PE1012"></leaf>
                  </eventsRec>
                </clade>
                <clade>
                  <name>47</name>
                  <eventsRec>
                    <speciation speciesLocation="23"></speciation>
                  </eventsRec>
                  <clade>
                    <name>ASPNG_7_PE827</name>
                    <eventsRec>
                      <leaf speciesLocation="21" geneName="ASPNG_7_PE827"></leaf>
                    </eventsRec>
                  </clade>
                  <clade>
                    <name>ASPNC_8_PE515</name>
                    <eventsRec>
                      <leaf speciesLocation="22" geneName="ASPNC_8_PE515"></leaf>
                    </eventsRec>
                  </clade>
                </clade>
              </clade>
              <clade>
                <name>41</name>
                <eventsRec>
                  <speciation speciesLocation="19"></speciation>
                </eventsRec>
                <clade>
                  <name>ASPTE_25_PE327</name>
                  <eventsRec>
                    <leaf speciesLocation="15" geneName="ASPTE_25_PE327"></leaf>
                  </eventsRec>
                </clade>
                <clade>
                  <name>43</name>
                  <eventsRec>
                    <speciation speciesLocation="18"></speciation>
                  </eventsRec>
                  <clade>
                    <name>ASPOR_5_PE280</name>
                    <eventsRec>
                      <leaf speciesLocation="17" geneName="ASPOR_5_PE280"></leaf>
                    </eventsRec>
                  </clade>
                  <clade>
                    <name>ASPFL_4_PE307</name>
                    <eventsRec>
                      <leaf speciesLocation="16" geneName="ASPFL_4_PE307"></leaf>
                    </eventsRec>
                  </clade>
                </clade>
              </clade>
            </clade>
            <clade>
              <name>33</name>
              <eventsRec>
                <speciation speciesLocation="14"></speciation>
              </eventsRec>
              <clade>
                <name>ASPCL_128_PE259</name>
                <eventsRec>
                  <leaf speciesLocation="8" geneName="ASPCL_128_PE259"></leaf>
                </eventsRec>
              </clade>
              <clade>
                <name>35</name>
                <eventsRec>
                  <speciation speciesLocation="13"></speciation>
                </eventsRec>
                <clade>
                  <name>NEFIS1_549_PE856</name>
                  <eventsRec>
                    <leaf speciesLocation="9" geneName="NEFIS1_549_PE856"></leaf>
                  </eventsRec>
                </clade>
                <clade>
                  <name>37</name>
                  <eventsRec>
                    <speciation speciesLocation="12"></speciation>
                  </eventsRec>
                  <clade>
                    <name>ASFUM1_6_PE786</name>
                    <eventsRec>
                      <leaf speciesLocation="10" geneName="ASFUM1_6_PE786"></leaf>
                    </eventsRec>
                  </clade>
                  <clade>
                    <name>ASPFC_6_PE383</name>
                    <eventsRec>
                      <leaf speciesLocation="11" geneName="ASPFC_6_PE383"></leaf>
                    </eventsRec>
                  </clade>
                </clade>
              </clade>
            </clade>
          </clade>
        </clade>
        <clade>
          <name>2</name>
          <eventsRec>
            <speciation speciesLocation="51"></speciation>
          </eventsRec>
          <clade>
            <name>YALIP1_3_PE695</name>
            <eventsRec>
              <leaf speciesLocation="29" geneName="YALIP1_3_PE695"></leaf>
            </eventsRec>
          </clade>
          <clade>
            <name>4</name>
            <eventsRec>
              <speciation speciesLocation="50"></speciation>
            </eventsRec>
            <clade>
              <name>5</name>
              <eventsRec>
                <speciation speciesLocation="40"></speciation>
              </eventsRec>
              <clade>
                <name>18</name>
                <eventsRec>
                  <speciation speciesLocation="39"></speciation>
                </eventsRec>
                <clade>
                  <name>ZYGRO_3_PE121</name>
                  <eventsRec>
                    <leaf speciesLocation="35" geneName="ZYGRO_3_PE121"></leaf>
                  </eventsRec>
                </clade>
                <clade>
                  <name>25</name>
                  <eventsRec>
                    <speciation speciesLocation="38"></speciation>
                  </eventsRec>
                  <clade>
                    <name>CAGLA1_6_PE57</name>
                    <eventsRec>
                      <leaf speciesLocation="36" geneName="CAGLA1_6_PE57"></leaf>
                    </eventsRec>
                  </clade>
                  <clade>
                    <name>YEAST_XVXV_PE35</name>
                    <eventsRec>
                      <leaf speciesLocation="37" geneName="YEAST_XVXV_PE35"></leaf>
                    </eventsRec>
                  </clade>
                </clade>
              </clade>
              <clade>
                <name>19</name>
                <eventsRec>
                  <speciation speciesLocation="34"></speciation>
                </eventsRec>
                <clade>
                  <name>34</name>
                  <eventsRec>
                    <speciationLoss speciesLocation="33"></speciationLoss>
                    <leaf speciesLocation="31" geneName="ASHGO_4_PE223"></leaf>
                  </eventsRec>
                </clade>
                <clade>
                  <name>LACTH_6_PE807</name>
                  <eventsRec>
                    <leaf speciesLocation="30" geneName="LACTH_6_PE807"></leaf>
                  </eventsRec>
                </clade>
              </clade>
            </clade>
            <clade>
              <name>6</name>
              <eventsRec>
                <speciationOut speciesLocation="49"></speciationOut>
              </eventsRec>
              <clade>
                <name>38</name>
                <eventsRec>
                  <transferBack destinationSpecies="32"></transferBack>
                  <leaf speciesLocation="32" geneName="KLLAC1_6_PE310"></leaf>
                </eventsRec>
              </clade>
              <clade>
                <name>8</name>
                <eventsRec>
                  <speciation speciesLocation="49"></speciation>
                </eventsRec>
                <clade>
                  <name>PICPG_4_PE454</name>
                  <eventsRec>
                    <leaf speciesLocation="41" geneName="PICPG_4_PE454"></leaf>
                  </eventsRec>
                </clade>
                <clade>
                  <name>10</name>
                  <eventsRec>
                    <speciation speciesLocation="48"></speciation>
                  </eventsRec>
                  <clade>
                    <name>DEHAN1_4_PE775</name>
                    <eventsRec>
                      <leaf speciesLocation="42" geneName="DEHAN1_4_PE775"></leaf>
                    </eventsRec>
                  </clade>
                  <clade>
                    <name>12</name>
                    <eventsRec>
                      <speciation speciesLocation="47"></speciation>
                    </eventsRec>
                    <clade>
                      <name>PISTI1_7_PE72</name>
                      <eventsRec>
                        <leaf speciesLocation="43" geneName="PISTI1_7_PE72"></leaf>
                      </eventsRec>
                    </clade>
                    <clade>
                      <name>14</name>
                      <eventsRec>
                        <speciation speciesLocation="46"></speciation>
                      </eventsRec>
                      <clade>
                        <name>CANDC_3_PE232</name>
                        <eventsRec>
                          <leaf speciesLocation="44" geneName="CANDC_3_PE232"></leaf>
                        </eventsRec>
                      </clade>
                      <clade>
                        <name>CANAW_4_PE216</name>
                        <eventsRec>
                          <leaf speciesLocation="45" geneName="CANAW_4_PE216"></leaf>
                        </eventsRec>
                      </clade>
                    </clade>
                  </clade>
                </clade>
              </clade>
            </clade>
          </clade>
        </clade>
      </clade>
    </phylogeny>
  </recGeneTree>
</recPhylo>
`
