require("../../../builds/output/testsRuntime");
require("../../../builds/output/bindableModel");
const assert = require("double-check").assert;

wprint = function (message) {
    console.log.apply("WPRINT:\n" + message);
};

const BindableModel = require("psk-bindable-model");

assert.callback("Nested object change event", (done) => {

    let testData = {
        name: {"firstname": "Rafael"},
    };

    let model = BindableModel.setModel(testData);

    let expectedChanges = 3;
    let finished = false;

    model.onChange("name.meta", function () {
        expectedChanges--;
        assert.equal(finished, false, "No more event changes were expected");

        if (expectedChanges === 0) {
            finished = true;
            done();
        }
    });

    model.name = {firstname: "John", meta: {data: "some data"}};
    setTimeout(() => {
        model.name.meta = {data: "some data"};
    }, 10);

    setTimeout(() => {
        model.name.meta.data = "some data";
    }, 20);

});


