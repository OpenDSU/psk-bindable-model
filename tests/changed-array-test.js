require("../../../psknode/bundles/bindableModel");
const assert = require("../../double-check").assert;

wprint = function (message) {
    console.log.apply("WPRINT:\n" + message);
};

const BindableModel = require("psk-bindable-model");

assert.callback("Nested object change event", (done) => {

    let testData = {
        items: [{
            name: "item1",
            id: 1,
            attachments:[{file:'file1'},{file:'file2'}]
        },
            {
                name: "item2",
                id: 2,
                attachments:[{file:'file1'},{file:'file2'}]
            }],
    };

    let model = BindableModel.setModel(testData);

    let expectedChanges = 1;
    let finished = false;

    model.onChange("name.items", function () {
        expectedChanges--;
        assert.equal(finished, false, "No more event changes were expected");

        if (expectedChanges === 0) {
            finished = true;
            done();
        }
    });

    setTimeout(()=>{
        console.log("Testing");
        model.items = [{
            name: "item2",
            id: 2,
            attachments:[{file:'file1'},{file:'file2'}]
        }];
        },100

    )



});


