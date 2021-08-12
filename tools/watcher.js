const chokidar = require("chokidar");
const { closeSync, openSync, utimesSync,appendFileSync } = require("fs");

// Hotfix for HMR for posthtml-modules
// https://github.com/parcel-bundler/parcel/issues/3218
chokidar
    .watch("src/html_partials", {
        persistent: true
    })
    .on("all", async (event, path) => {
        if (event === "change") {

            // usage
            const filename = "./src/index.html";
            appendFileSync(filename,' ');
            //touch(filename);
        }
    });
