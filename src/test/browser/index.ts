import express from "express";
import { ServerConstants } from "../../utils/ServerConstants";

class BrowserTest {
  private readonly testConfig: any;
  constructor(testConfig: any) {
    this.testConfig = testConfig;
  }

  async serveTestAssets(): Promise<void> {
    const path = __dirname + "/../../../public";
    let server: express.Express = express();
    server.use(express.static(path));
    server.get("*", function (req, res) {
      res.sendFile(path + "/index.html");
    });

    server.listen(ServerConstants.TEST_SERVER_PORT, () => {
      console.log(`test server started at port: ${ServerConstants.TEST_SERVER_PORT}`);
    });
  }
}

const browserTest: BrowserTest = new BrowserTest({});
console.log(`test scripts has started executing...`);
browserTest.serveTestAssets().then(() => {
  console.log(`test scripts has been executed!`);
});
