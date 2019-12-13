const SoundPubSub = require("soundpubsub").soundPubSub;
const CHAIN_CHANGED = 'chainChanged';
const WILDCARD = "*";
const CHAIN_SEPARATOR = ".";
const MODEL_PREFIX = "Model";
const compactor = function (message, channel) {
    if (message.type === CHAIN_CHANGED) {
        return channel;
    }
};
SoundPubSub.registerCompactor(CHAIN_CHANGED, compactor);

let modelContor = 0;

class PskBindableModel {

    static setModel(_model) {
        let root = undefined;
        let targetPrefix = MODEL_PREFIX + CHAIN_SEPARATOR + modelContor + CHAIN_SEPARATOR;
        let observedChains = new Set();
        modelContor++;

        function extendChain(parentChain, currentChain) {
            return parentChain ? parentChain + CHAIN_SEPARATOR + currentChain : currentChain
        }

        function createChannelName(chain) {
            return targetPrefix + chain;
        }

        function makeSetter(parentChain) {
            return function (obj, prop, value) {
                let chain = extendChain(parentChain, prop);
                if (typeof value === "object") {

                    obj[prop] = proxify(value, chain);

                    if (Array.isArray(value)) {
                        for (let i = 0; i < value.length; i++) {
                            if (typeof obj[prop][i] === "object") {
                                obj[prop][i] = proxify(obj[prop][i], extendChain(chain, i));
                            }
                        }
                    }
                } else {
                    obj[prop] = value;
                }
                root.notify(chain);
                return true;
            }
        }

        function pushHandler(target, parentChain) {
            return function () {
                try {
                    let arrayLength = Array.prototype.push.apply(target, arguments);
                    let index = arrayLength - 1;
                    root.notify(extendChain(parentChain, index));
                    return arrayLength;
                } catch (e) {
                    console.log("An error occured in Proxy");
                    throw e;
                }
            }
        }

        function arrayFnHandler(fn, target, parentChain) {
            return function () {
                try {
                    let returnedValue = Array.prototype[fn].apply(target, arguments);
                    root.notify(parentChain);
                    return returnedValue;
                } catch (e) {
                    console.log("An error occured in Proxy");
                    throw e;
                }
            }
        }

        function makeArrayGetter(parentChain) {
            return function (target, prop) {
                const val = target[prop];
                if (typeof val === 'function') {
                    switch (prop) {
                        case "push":
                            return pushHandler(target, parentChain);
                        default:
                            return arrayFnHandler(prop, target, parentChain);
                    }
                }
                return val;
            }
        }

        function proxify(obj, parentChain) {

            if (typeof obj !== "object") {
                return obj;
            }

            let isRoot = !parentChain;
            let notify, onChange, getChainValue, setChainValue;
            if (isRoot) {
                notify = function (changedChain) {

                    function getRelatedChains(changedChain) {
                        let chainsRelatedSet = new Set();
                        chainsRelatedSet.add(WILDCARD);
                        let chainSequence = changedChain.split(CHAIN_SEPARATOR).map(el => el.trim());

                        let chainPrefix = "";
                        for (let i = 0; i < chainSequence.length; i++) {
                            if (i !== 0) {
                                chainPrefix += CHAIN_SEPARATOR + chainSequence[i];
                            } else {
                                chainPrefix = chainSequence[i];
                            }
                            chainsRelatedSet.add(chainPrefix);
                        }

                        observedChains.forEach((chain) => {
                            if (chain.startsWith(changedChain)) {
                                chainsRelatedSet.add(chain);
                            }
                        });

                        return chainsRelatedSet;
                    }

                    let changedChains = getRelatedChains(changedChain);

                    changedChains.forEach(changedChain => {
                        SoundPubSub.publish(createChannelName(changedChain), {
                            type: CHAIN_CHANGED,
                            chain: changedChain
                        });
                    })
                };

                getChainValue = function (chain) {
                    let chainSequence = chain.split(CHAIN_SEPARATOR).map(el => el.trim());
                    let reducer = (accumulator, currentValue) => {
                        if (accumulator !== null && typeof accumulator !== 'undefined') {
                            return accumulator[currentValue];
                        }
                        return undefined;
                    };
                    return chainSequence.reduce(reducer, root);
                };

                setChainValue = function (chain, value) {
                    let chainSequence = chain.split(CHAIN_SEPARATOR).map(el => el.trim());

                    let reducer = (accumulator, currentValue, index, array) => {
                        if (accumulator !== null && typeof accumulator !== 'undefined') {
                            if (index === array.length - 1) {
                                accumulator[currentValue] = value;
                                return true;
                            }
                            accumulator = accumulator[currentValue];
                            return accumulator;
                        }
                        return undefined;
                    };
                    return chainSequence.reduce(reducer, root);
                };

                onChange = function (chain, callback) {
                    observedChains.add(chain);
                    SoundPubSub.subscribe(createChannelName(chain), callback);
                }
            }
            let setter = makeSetter(parentChain);

            let handler = {
                get: function (obj, prop) {
                    if (isRoot) {
                        switch (prop) {
                            case "onChange":
                                return onChange;
                            case "notify":
                                return notify;
                            case "getChainValue":
                                return getChainValue;
                            case "setChainValue":
                                return setChainValue;
                        }
                    }

                    return obj[prop];
                },
                set: makeSetter(parentChain),

                deleteProperty: function (oTarget, sKey) {
                    delete oTarget[sKey];
                },

                ownKeys: function (oTarget) {
                    return Object.keys(oTarget);
                },
                has: function (oTarget, sKey) {
                    return sKey in oTarget
                },
                defineProperty: function (oTarget, sKey, oDesc) {
                    let oDescClone = Object.assign({}, oDesc);
                    oDescClone.set = function (obj, prop, value) {
                        if (oDesc.hasOwnProperty("set")) {
                            oDesc.set(obj, prop, value);
                        }
                        setter(obj, prop, value);
                    };
                    return Object.defineProperty(oTarget, sKey, oDescClone);
                },
                getOwnPropertyDescriptor: function (oTarget, sKey) {
                    return Object.getOwnPropertyDescriptor(oTarget, sKey)
                }
            };

            if (Array.isArray(obj)) {
                handler.get = makeArrayGetter(parentChain);
            }

            //proxify inner objects
            Object.keys(obj).forEach(prop => {
                obj[prop] = proxify(obj[prop], extendChain(parentChain, prop))
            });

            return new Proxy(obj, handler);
        }

        root = proxify(_model);
        return root;
    }
}

module.exports = PskBindableModel;