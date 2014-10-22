const {Cc, Ci, Cu, ChromeWorker} = require("chrome");
Cu.import("resource://gre/modules/Task.jsm");
const {data} = require("sdk/self");
const test = require("sdk/test");

const {LWCAClassifier} = require("lwca_refined");
let scriptLoader = Cc["@mozilla.org/moz/jssubscript-loader;1"].getService(Ci.mozIJSSubScriptLoader);
scriptLoader.loadSubScript(data.url("test/cnn_docs.js"));

function testVisits(visits) {
   let titleResults = {};
   let fullTextResults = {};
   let fullTextCount = 0;
   let len = visits.length;
   let ftLen = 20;
   for (let visit of visits) {
      category = c.classify(visit[0], visit[1]);
      titleResults[category] = (titleResults[category] || 0) + 1;
      if (fullTextCount < ftLen) {
        category = c.classify(visit[0], visit[1] + " " + visit[2]);
        fullTextResults[category] = (fullTextResults[category] || 0) + 1;
        fullTextCount++;
      }
    }
    Object.keys(titleResults).forEach(cat => {
      titleResults[cat] = Math.round(titleResults[cat] * 100 / len);
    });
    Object.keys(fullTextResults).forEach(cat => {
      fullTextResults[cat] = Math.round(fullTextResults[cat] * 100 / ftLen);
    });
    return {title: titleResults, fullText: fullTextResults};
}

function outputCatResults(results, catName, expectedCat) {
  dump("  set category: " + catName);
  if (expectedCat) {
     dump(", mapped to: '" + expectedCat + "', title precision: " +
          (results.title[expectedCat] || 0) + "%" +
          ", fulltext precision: " +
          (results.fullText[expectedCat] || 0) + "%");
  }
  dump("\n");
  let titleOrdered = Object.keys(results.title).sort((a,b) => {return results.title[b] - results.title[a];});
  let fullTextOrdered = Object.keys(results.fullText).sort((a,b) => {return results.fullText[b] - results.fullText[a];});
  dump ("\t  Url+Title\t\t\t  Url+FullText\n");
  while (titleOrdered.length) {
    let tCat = titleOrdered.shift();
    let fCat = fullTextOrdered.shift();
    dump("\t" + tCat + ":" + results.title[tCat] + "%");
    if (fCat) {
      dump("\t\t\t" + fCat + ":" + results.fullText[fCat] + "%");
    }
    dump("\n");
  }
  dump("\n");
}

function procTestSet(testSet, name) {
  dump("TEST SET: " + name + "\n");
  Object.keys(testSet).forEach(cat => {
    let obj = testSet[cat];
    if (obj instanceof Array) {
    }
    else {
      let results = testVisits(obj.visits);
      outputCatResults(results, obj.name, obj.expectedCat);
    }
  });
}


exports["test lwca"] = function test_PrefsManagerPrefs(assert, done) {
  Task.spawn(function() {
    try {
      dump("Loading LWCA...\n");
      c = new LWCAClassifier();
      yield c.init();
      dump("Fnished loading LWCA\n");
      /*
      testCollection.forEach(collection => {
        let results = testVisits(collection.visits);
        outputCatResults(results, collection.name, collection.expectedCat);
      });
      */
      procTestSet(cnnTest, "CNN PATH SELECTED DOCS");
      assert.ok(true);
      done();
    } catch (ex) {
      dump(ex + " ERROR");
      done();
    }
  });
}

test.run(exports);
