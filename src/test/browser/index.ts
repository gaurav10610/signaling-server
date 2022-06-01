import express from "express";
import { init } from "../../main";
import { ServerConstants } from "../../utils/ServerConstants";

class BrowserTest {
  private readonly testConfig: any;
  constructor(testConfig: any) {
    this.testConfig = testConfig;
  }

  async serveTestAssets(): Promise<void> {
    const path = __dirname + "/../../../public/test-assets";
    let server = express();
    server.use(express.static(path));
    server.get("*", function (req, res) {
      console.log(path);
      res.sendFile(path + "/index.html");
    });

    server.listen(ServerConstants.TEST_SERVER_PORT, () => {
      console.log(
        global.logger.info(
          `test server started at port: ${ServerConstants.TEST_SERVER_PORT}`
        )
      );
    });
  }

  async start(): Promise<void> {
    await init();
    await this.serveTestAssets();
  }
}

const browserTest: BrowserTest = new BrowserTest({});
console.log(`test scripts has started executing...`);
browserTest.start().then(() => {
    global.logger.info(`test scripts has been executed!`);
});
