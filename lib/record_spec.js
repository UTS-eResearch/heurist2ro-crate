/* This is part of Calcyte a tool for implementing the DataCrate data packaging
spec.  Copyright (C) 2018  University of Technology Sydney

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/


const assert = require('assert');
const chai = require('chai');
chai.use(require('chai-fs'));


const fs = require("fs-extra");
const xml2js = require("xml2js");

const ROCrate = require("ro-crate").ROCrate;

const Record = require('./record');
const Converter = require("./h2roc");


const test1 = `

<record visibility="public" visnote="no login required" selected="no" depth="0">
<id>48</id>
<type id="55" conceptID="1125-26">Educational institution</type>
<citeAs>https://heuristplus.sydney.edu.au/h5-alpha/?recID=48&amp;db=EN_test_sefton</citeAs>
<title>Sydney Teacher's College, Camperdown, NSW, Australia</title>
<added>2020-05-05 08:41:37</added>
<modified>2020-05-05 18:41:39</modified>
<workgroup id="1">Database Managers</workgroup>
<detail conceptID="2-1" name="Name of institution" id="1" basename="Name / Title">Sydney Teacher's College</detail>
<detail conceptID="1125-78" name="Place" id="998" basename="Place 2" isRecordPointer="true">52</detail>
<detail conceptID="2-36" id="36" basename="Original ID">1125-58371</detail>
</record>
`

const test2 = `
<record visibility="public" visnote="no login required" selected="no" depth="0">
<id>19784</id>
<type id="24" conceptID="1125-24">Eventlet</type>
<citeAs>https://heuristplus.sydney.edu.au/h5-alpha/?recID=19784&amp;db=ExpertNation</citeAs>
<title>Hales G.M.B. : Enlisted 1 Sep 1916</title>
<added>2014-07-09 18:20:28</added>
<modified>2019-12-17 00:31:46</modified>
<workgroup id="0">public</workgroup>
<detail conceptID="2-16" name="Person &gt;" id="16" basename="Person &gt;" isRecordPointer="true">3073</detail>
<raw>1916-09-01</raw>
<year>1916</year>
<month>9</month>
<day>1</day>
<detail conceptID="1125-77" name="Type of event" id="77" basename="Type of event" termID="3302" termConceptID="1125-3302" ParentTerm="Event Type">Enlisted</detail>
<detail conceptID="1125-251" name="Sources" id="251" basename="Sources" termID="8287" termConceptID="1125-8287" ParentTerm="Sources">not recorded</detail>
<detail conceptID="1125-256" name="Source Details free text" id="256" basename="Source Details free text">n/a</detail>
</record>
`
const test3 =`
<record visibility="public" visnote="no login required" selected="no" depth="0">
<id>65685</id>
<type id="37" conceptID="1125-37">Occupation eventlet</type>
<citeAs>https://heuristplus.sydney.edu.au/h5-alpha/?recID=65685&amp;db=ExpertNation</citeAs>
<title>Anderson W.H. : Accountant 1933 - 1935 Shell Company of Australasia Ltd. @ Melbourne [ VIC Australia ]</title>
<added>0000-00-00 00:00:00</added>
<modified>2020-06-04 00:36:35</modified>
<workgroup id="0">public</workgroup>
<raw>1933</raw>
<year>1933</year>
<raw>1935</raw>
<year>1935</year>
<detail conceptID="2-16" name="Person &gt;" id="16" basename="Person &gt;" isRecordPointer="true">4900</detail>
<detail conceptID="2-21" name="Organisation &gt;" id="21" basename="Organisation &gt;" isRecordPointer="true">65676</detail>
<detail conceptID="1125-78" name="Place" id="78" basename="Place" isRecordPointer="true">5532</detail>
<detail conceptID="1125-150" name="Occupation title" id="150" basename="Occupation type" termID="4674" termConceptID="1125-4674" ParentTerm="Occupation">Accountant</detail>
<detail conceptID="1125-205" name="Sector" id="205" basename="Sector" termID="5000" termConceptID="1125-5000" ParentTerm="Occupation sector">Banks, Business, Finance and Commerce</detail>
<detail conceptID="1125-251" name="Sources" id="251" basename="Sources" termID="5223" termConceptID="1125-5223" ParentTerm="Sources">Australian Dictionary of Biography</detail>
<detail conceptID="1125-256" name="Source Details free text" id="256" basename="Source Details free text">http://adb.anu.edu.au/biography/anderson-sir-william-hewson-9360</detail>
<detail conceptID="1125-14053" name="Department of Government" id="14053" basename="Department of Government" termID="8633" termConceptID="1125-8633" ParentTerm="Government Department">No</detail>
</record>
`

test4 = `
<record visibility="public" visnote="no login required" selected="no" depth="0">
<id>16</id>
<type id="56" conceptID="1125-25">Place 2</type>
<citeAs>https://heuristplus.sydney.edu.au/h5-alpha/?recID=16&amp;db=EN_test_sefton</citeAs>
<title>Victoria [ VIC Australia ]</title>
<added>2020-05-05 08:41:37</added>
<modified>2020-05-05 08:41:37</modified>
<workgroup id="1">Database Managers</workgroup>
<detail conceptID="2-1" name="Place name" id="1" basename="Name / Title">Victoria</detail>
<detail conceptID="2-2" name="City, State, Province or Region" id="2" basename="Short name">VIC</detail>
<detail conceptID="2-26" name="Country" id="26" basename="Country" termID="108" termConceptID="2-108" ParentTerm="Country">Australia</detail>
<detail conceptID="2-28" name="Mappable location" id="28" basename="Mappable location (geospatial)">
<geo>
<type>point</type>
<wkt>POINT(144.759351 -37.016167)</wkt>
</geo>
</detail>
<detail conceptID="1125-101" name="Locational certainty" id="227" basename="Locational certainty" termID="5342" termConceptID="1125-3340" ParentTerm="Certainty of localisation">1. High confidence</detail>
<detail conceptID="1125-131" name="Accuracy" id="233" basename="Accuracy" termID="5354" termConceptID="1125-3661" ParentTerm="Accuracy of location">7. To ADM1 eg. state, province, county</detail>
<detail conceptID="2-36" id="36" basename="Original ID">1125-66618</detail>
</record>
`

describe('Record to Item', function () {
    it('Returns an item', async function () {
        // One test record
        const recordXml = await xml2js.parseStringPromise(test1);
        //console.log(recordXml.record);
        const converter = new Converter({
            destDir: "new_crate", // TODO - should not be needing this in this test
            filesDir: "test_data/files", // TODO - further refactoring needed - we should not be copying files here!!!
            crateTemplate: null, // Not used
            hxml: null, // Not used in this bit
            domain: "single_record", 
            configPath: JSON.parse(await fs.readFile("test_data/expert-nation.config.json"))
        });

        rec = new Record(recordXml.record, converter);
        const item = await rec.toItem();
        assert.equal(item["@id"], "#single_record_48", "Has correct ID");
        assert.equal(item["name"], "Sydney Teacher's College, Camperdown, NSW, Australia", "Has correct Name");
        assert.equal(item["name_Title"], "Sydney Teacher's College", "Has correct Institution name TODO: How do we map this to an ontology?");
        assert.equal(item["place"]["@id"], "#single_record_52", "Has correct place reference");
    });

    it('Can extract dates out of eventlets', async function () {
        // One test record
        const recordXml = await xml2js.parseStringPromise(test2);
        //console.log(recordXml.record);
        const converter = new Converter({
            destDir: "new_crate", // TODO - should not be needing this in this test
            filesDir: "test_data/files", // TODO - further refactoring needed - we should not be copying files here!!!
            crateTemplate: null, // Not used
            hxml: null, // Not used in this bit
            domain: "single_record", 
            configPath: JSON.parse(await fs.readFile("test_data/expert-nation.config.json"))
        });

        rec = new Record(recordXml.record, converter);
        const item = await rec.toItem();
        assert.equal(item["startDate"], "1916-09-01", "Has correct Date");


        const recordXml1 = await xml2js.parseStringPromise(test3);
        rec = new Record(recordXml1.record, converter);
        const item1 = await rec.toItem();
        assert.equal(item1["startDate"], "1933", "Has correct start Date");
        assert.equal(item1["endDate"], "1935", "Has correct end Date");
       
    });

    it('Can get geo infortmation', async function () {
        // One test record
        const recordXml = await xml2js.parseStringPromise(test4);
        //console.log(recordXml.record);
        const converter = new Converter({
            destDir: "new_crate", // TODO - should not be needing this in this test
            filesDir: "test_data/files", // TODO - further refactoring needed - we should not be copying files here!!!
            crateTemplate: null, // Not used
            hxml: null, // Not used in this bit
            domain: "single_record", 
            configPath: JSON.parse(await fs.readFile("test_data/expert-nation.config.json"))
        });

        rec = new Record(recordXml.record, converter);
        const item = await rec.toItem();
        assert.equal(item["geo"]["@id"], "#single_record_POINT-144-759351--37-016167-", "Has a location");
        assert.equal(converter.crate.getItem(item["geo"]["@id"]).latitude, "-37.016167", "Has a latitute");



       
    });
    
});

