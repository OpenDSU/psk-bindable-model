class PskBindableModel {

    static setModel(_model) {
        let root = undefined;
        let isLocked = false;
        let isInInitializationPhase = true;
        let lockedQueue = new Set();
        let observers = {};

        function makeChain(parentChain, currentChain) {
            return parentChain ? parentChain + "." + currentChain : currentChain
        }

        function makeSetter(parentChain) {
            return function (obj, prop, value) {
                let chain = makeChain(parentChain, prop);
                if (isInInitializationPhase === false) {
                    isLocked = true;
                }
                if (typeof value === "object") {

                    if (Array.isArray(value)) {
                        obj[prop] = proxify(value, chain);
                        for (let i = 0; i < value.length; i++) {
                            if (typeof obj[prop][i] === "object") {
                                //obj[prop][i] = proxify(obj[prop][i], chain + "." + i);
                                proxifyNestedObjects(obj[prop][i], chain + "." + i);
                            }
                        }

                    } else {
                        //there might be ongoing events that should be triggered.
                        //don't block them right now.
                        setImmediate(() => {
                            isLocked = true;
                        });
                        obj[prop] = proxify(value, chain);
                        proxifyNestedObjects(obj[prop], chain);
                    }

                } else {
                    //at this point all nested objects are visited, we can notify about changes
                    isLocked = false;
                    obj[prop] = value;
                }
                root.notify(chain, value);
                return true;
            }
        }

        /**
         *TODO refactor this
         */

        function pushHandler(target, parentChain){
            return function (el) {
                try {
                    let arrayLength = Array.prototype.push.apply(target, arguments);
                    root.notify(parentChain + "." + (arrayLength - 1));
                    return arrayLength;
                } catch (e) {
                    console.log("An error occured in Proxy");
                    throw e;
                }
            }
        }

        function arrayFnHandler(fn, target, parentChain){
            return function (el) {
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

        function proxifyNestedObjects(obj, parentChain) {
            for (let prop in obj) {
                if (typeof obj[prop] === "object") {
                    obj[prop] = obj[prop];
                    proxifyNestedObjects(obj[prop]);
                }
            }
            if (!isInInitializationPhase) {
                setImmediate(() => {
                    if (isLocked === true) {
                        isLocked = false;
                        notifyChain(lockedQueue, parentChain);
                        lockedQueue.clear();
                    }
                });
            }

        }

        function getObjectChains(parentChain, parentObj) {
            let chains = [parentChain];

            let addChainPrefix = function (parent, obj) {
                if (typeof obj === "object" && !Array.isArray(obj)) {
                    for (let prop in obj) {
                        (addChainPrefix(parent + "." + prop, obj[prop]));
                    }
                } else {
                    chains.push(parent);
                }
            };

            addChainPrefix(parentChain, parentObj);
            return chains;
        }

        function notifyChain(chainSet, parentChain) {
            function _triggerObservers(chain, parentChain) {
                if (observers[chain]) {
                    observers[chain].forEach(callback => {
                        setImmediate(() => {
                            if (parentChain) {
                                callback(parentChain);
                            } else {
                                callback(chain);
                            }
                        });
                    })
                }
            }

            chainSet.forEach(_triggerObservers);
            _triggerObservers("*", parentChain)
        }

        function proxify(obj, parentChain) {
            let isRoot = !parentChain;
            let notify, onChange, getChainValue, setChainValue;
            if (isRoot) {
                notify = function (changedChain, value) {

                    function getPrefixes(changedChain) {
                        let prefixSet = new Set();
                        let chainSequence = changedChain.split(".").map(el => el.trim());

                        let chainPrefix = "";
                        for (let i = 0; i < chainSequence.length; i++) {
                            if (i !== 0) {
                                chainPrefix += "." + chainSequence[i];
                            } else {
                                chainPrefix = chainSequence[i];
                            }
                            prefixSet.add(chainPrefix);
                        }
                        return prefixSet;
                    }

                    //keep a queue with all changed chains
                    if (isLocked) {
                        let changedChains = getObjectChains(changedChain, value);
                        changedChains.forEach((chain) => {
                            lockedQueue.add(chain);
                        });
                        lockedQueue = new Set([...getPrefixes(changedChain), ...lockedQueue]);
                    } else {
                        notifyChain(getPrefixes(changedChain), changedChain);
                    }
                };

                getChainValue = function (chain) {
                    let chainSequence = chain.split(".").map(el => el.trim());
                    let reducer = (accumulator, currentValue) => {
                        if (accumulator !== null && typeof accumulator !== 'undefined') {
                            return accumulator[currentValue];
                        }
                        return undefined;
                    };
                    return chainSequence.reduce(reducer, root);
                };

                setChainValue = function (chain, value) {
                    let chainSequence = chain.split(".").map(el => el.trim());

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
                    if (typeof callback === "function") {
                        if (!observers[chain]) {
                            observers[chain] = [];
                        }
                        observers[chain].push(callback);
                    } else {
                        console.error("callback should be a function");
                    }
                }
            }
            let setter = makeSetter(parentChain);

            let objectHandler = {
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

            let arrayHandler = {
                get: makeArrayGetter(parentChain),
                set: makeSetter(parentChain)
            };

            let handler = Array.isArray(obj) ? arrayHandler : objectHandler;
            return new Proxy(obj, handler);
        }

        root = proxify(_model);
        proxifyNestedObjects(root);
        isInInitializationPhase = false;
        return root;
    }
}

module.exports = PskBindableModel;