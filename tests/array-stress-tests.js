require("../../../builds/output/testsRuntime");
require("../../../builds/output/bindableModel");
const assert = require("double-check").assert;
const stressTestData = require("./stress-test-model");

const BindableModel = require("psk-bindable-model");

wprint = function(message) {
  console.log.apply("WPRINT:\n" + message);
};

let resolvers = [];
let __50SecondsTimer = 1000 * 50;

assert.callback(
  "Array stress test",
  done => {
    let model = BindableModel.setModel(stressTestData);

    let changesCount = 0;
    let expectedChanges = 50000;
    let finished = false;

    let __stepInterval = 1000;
    let __startingTestTime = new Date().getTime();

    let checkCounter = function() {
      if (
        typeof resolvers[changesCount] !== "undefined" &&
        typeof resolvers[changesCount].resolver === "function"
      ) {
        if (changesCount !== 0 && changesCount % __stepInterval === 0) {
          _logTime(
            changesCount,
            resolvers[changesCount - __stepInterval].timestamp
          );
        }
        resolvers[changesCount].resolver();
      } else {
        console.error("errr resolvers");
      }

      assert.equal(false, finished, "No more changes were expected!");
      changesCount++;
      if (changesCount === expectedChanges) {
        finished = true;
        done();
      }
    };

    let selectedItems = model.getChainValue("dossierDetails.selected");
    let sourceItems = model.getChainValue("dossierDetails.items");

    sourceItems.forEach(function(el, index) {
      model.setChainValue(`dossierDetails.items.${index}.selected`, "selected");
      selectedItems.push(el);
    });

    assert.equal(
      selectedItems.length,
      sourceItems.length,
      "The length of the arrays should be the same!"
    );

    model.onChange("dossierDetails.selected", checkCounter);

    function modelChange(index) {
      return new Promise(function(resolve, reject) {
        resolvers.push({
          resolver: resolve,
          timestamp: new Date().getTime()
        });
        let itemIndex = (index * 2) % sourceItems.length;
        let item = model.getChainValue(`dossierDetails.items.${itemIndex}`);

        selectedIndex = selectedItems.findIndex(function(el) {
          return el.name === item.name;
        });
        let isSelected = item.selected === "selected" && selectedIndex > -1;

        if (isSelected) {
          item.selected = "";
          let newFilteredArray = selectedItems.filter(function(el) {
            el.name !== item.name;
          });
          model.setChainValue("dossierDetails.selected", newFilteredArray);
        } else {
          item.selected = "selected";
          selectedItems.push(item);
        }
      });
    }

    let _logTime = function(steps, timestamp) {
      const time = (new Date().getTime() - timestamp) / 1000;
      console.log(
        `[Stress phase] Steps [` +
          `${steps - __stepInterval + 1} - ${steps}` +
          `] finished in ${time} seconds!`
      );
    };

    let sequence = Promise.resolve();
    for (let index = 1; index <= expectedChanges; index++) {
      sequence = sequence.then(function() {
        return modelChange(index);
      });
    }

    sequence.then(function() {
      console.log(
        `[Stress phase] Finished stress testing of` +
          ` ${expectedChanges} changes in` +
          ` ${(new Date().getTime() - __startingTestTime) / 1000}` +
          ` seconds!`
      );
    });
  },
  __50SecondsTimer
);
