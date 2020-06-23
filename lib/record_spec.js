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
const Record = require('./record');
const chai = require('chai');
chai.use(require('chai-fs'));
const ROCrate = require("ro-crate").ROCrate;
const fs = require("fs-extra");
const Converter = require("./h2roc");
const xml2js = require("xml2js");



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
<record visibility="public" visnote="no login required" selected="no" depth="0">
<id>17</id>
<type id="54" conceptID="1125-31">Schooling</type>
<citeAs>https://heuristplus.sydney.edu.au/h5-alpha/?recID=17&amp;db=EN_test_sefton</citeAs>
<title>Colgan T.D. : Gannon's Creek Public School</title>
<added>2020-05-05 08:41:37</added>
<modified>2020-05-05 18:41:39</modified>
<workgroup id="1">Database Managers</workgroup>
<detail conceptID="2-16" name="Parent record (person)" id="16" basename="Person" isRecordPointer="true">2</detail>
<detail conceptID="1125-97" name="School" id="995" basename="Educational institution &gt;" isRecordPointer="true">25</detail>
<detail conceptID="1125-251" name="Sources" id="996" basename="Sources" termID="8589" termConceptID="1125-5227" ParentTerm="Sources">State Records NSW</detail>
<detail conceptID="1125-256" name="Source Details free text" id="997" basename="Source Details free text">Dept Education staff card - 171</detail>
<detail conceptID="2-36" id="36" basename="Original ID">1125-58370</detail>
</record>
`


describe('Record to Item', function () {
    it('Returns an item', async function () {
        // One test record
        const recordXml = await xml2js.parseStringPromise(test1);
        console.log(recordXml.record);
        const converter = new Converter({
            destDir: "new_crate",
            filesDir: "test_data/files", // TODO - further refactoring needed - we should not be copying files here!!!
            crateTemplate: null, // Not used
            hxml: null, // Not used in this bit
            domain: "single_record", 
            configPath: JSON.parse(await fs.readFile("test_data/expert-nation.config.json"))
        });
        rec = new Record(recordXml.record, converter);
        const item = rec.toItem();
        console.log(item);


    });
    
});

