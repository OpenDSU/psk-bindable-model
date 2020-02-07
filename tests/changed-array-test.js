require("../../../psknode/bundles/testsRuntime");
require("../../../psknode/bundles/bindableModel");
const assert = require("../../double-check").assert;

wprint = function (message) {
    console.log.apply("WPRINT:\n" + message);
};

const BindableModel = require("psk-bindable-model");

assert.callback("Nested object change event", (done) => {

    let testData = {
        rafa: "rafa",
        items: [{
            name: "item1",
            id: 1,
            attachments: [{file: 'file1'}, {file: 'file2'}]
        },
            {
                name: "item2",
                id: 2,
                attachments: [{file: 'file12'}, {file: 'file22'}]
            }],
    };

    let model = BindableModel.setModel(testData);

    let expectedChanges = 1;
    let finished = false;

    model.onChange("items", function (e) {
        console.log(e);
        expectedChanges--;
        assert.equal(finished, false, "No more event changes were expected");

        if (expectedChanges === 0) {
            finished = true;
            done();
        }
    });

    model.items = [{
        name: "item3",
        id: 3,
        attachments: [{file: 'file111', "versions":[1,2,3]}, {file: 'file222',"versions":[4,5,6]}]
    }];
});


