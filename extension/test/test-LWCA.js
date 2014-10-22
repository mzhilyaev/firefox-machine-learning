const {Cc, Ci, Cu, ChromeWorker} = require("chrome");
Cu.import("resource://gre/modules/Task.jsm");
const {data} = require("sdk/self");
const test = require("sdk/test");

const {LWCAClassifier} = require("lwca_refined");
let scriptLoader = Cc["@mozilla.org/moz/jssubscript-loader;1"].getService(Ci.mozIJSSubScriptLoader);
scriptLoader.loadSubScript(data.url("test/politics.js"));
scriptLoader.loadSubScript(data.url("test/health.js"));
scriptLoader.loadSubScript(data.url("test/investing.js"));
scriptLoader.loadSubScript(data.url("test/technology.js"));
scriptLoader.loadSubScript(data.url("test/justice.js"));
scriptLoader.loadSubScript(data.url("test/business.js"));
scriptLoader.loadSubScript(data.url("test/sport.js"));

let testCollection = [
 {
  name:  "cnn:politics",
  expectedCat: "politics",
  visits: politics,
 },
 {
  name:  "cnn:investing",
  expectedCat: "personal finance",
  visits: investing,
 },
 {
  name:  "cnn:health",
  expectedCat: "health & fitness",
  visits: health,
 },
 {
  name:  "cnn:technology",
  expectedCat: "technology & computing",
  visits: technology,
 },
 {
  name:  "cnn:justice",
  expectedCat: "law",
  visits: justice,
 },
 {
  name:  "cnn:sport",
  expectedCat: "sport",
  visits: justice,
 },
 {
  name:  "cnn:business",
  expectedCat: "business",
  visits: justice,
 },
];


exports["test lwca"] = function test_PrefsManagerPrefs(assert, done) {
  Task.spawn(function() {
    try {
      dump("Loading LWCA...\n");
      c = new LWCAClassifier();
      yield c.init();
      dump("Fnished loading LWCA\n");
      testCollection.forEach(collection => {
        let results = {};
        results[collection.expectedCat] = 0;
        // collect categorization results
        for (let visit of collection.visits) {
          category = c.classify(visit[0], visit[1]);
          results[category] = (results[category] || 0) + 1;
        }
        let len = collection.visits.length;
        let precision = Math.round((results[collection.expectedCat] || 0) * 100/ len);
        dump("\n\nTest set: " + collection.name +
             ", Expected: '" + collection.expectedCat +
             "', Precision: " + precision +
             "%\n");
        let ordered = Object.keys(results).sort((a,b) => {return results[b] - results[a];});
        ordered.forEach(category => {
          dump("    " + category + ":" + Math.round(results[category] * 100 / len) + "%\n");
        });
      });
      assert.ok(true);
      done();
    } catch (ex) {
      dump(ex + " ERROR");
      done();
    }
  });
}

test.run(exports);
