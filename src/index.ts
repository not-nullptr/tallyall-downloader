import { JSDOM } from "jsdom";
import { decode } from "he";
import fs from "fs";
import https from "https";

async function downloadFile(url: string) {
    const path = "./" + decodeURI(new URL(url).pathname);
    fs.mkdirSync(path.split("/").slice(0, -1).join("/"), {
        recursive: true,
    });
    if (fs.existsSync(path) && !fs.lstatSync(path).isFile()) return;
    return new Promise<void>((resolve, reject) => {
        https.get(url, (res) => {
            const filePath = fs.createWriteStream(path);
            res.pipe(filePath);
            filePath.on("finish", () => {
                filePath.close();
                console.log(`${path} finished!`);
                resolve();
            });
        });
    });
}

async function traverseURL(url: string) {
    const dom = await JSDOM.fromURL(url);
    const document = dom.window.document;
    document.querySelectorAll("a").forEach((a) => {
        const href = decodeURI(a.getAttribute("href") || "").replaceAll(
            "%26",
            "&"
        );
        if (href.endsWith("/") && href !== "../") {
            // href is a directory
            traverseURL(url + href);
        } else {
            // href needs to be downloaded
            downloadFile(url + href);
        }
    });
}

const BASE_URL = "https://tallyall.club/go/Tally Hall/";

(async () => {
    traverseURL(BASE_URL);
    return;
})();
