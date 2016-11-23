const { indexBy, assoc, map, prop, curry } = require('ramda');

// innerJoin :: String -> String -> [a] -> [b] -> [{String:a}]
const innerJoin = curry((k1, k2, l1, l2) => {
    var list2Map = indexBy(prop(k2), l2);
    return map(l1v => assoc(k1, list2Map[l1v[k1]], l1v), l1)
});

module.exports = innerJoin;
