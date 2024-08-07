const { exec, execSync, spawn } = require("child_process");
const fs = require("fs");

let resArray = [];
const githubLINK =
  process.argv[2] || "https://github.com/ManojaD2004/test-cicd-app-v1.git";
console.log(githubLINK);
let created = false;
const installCommand = "npm install";
const buildCommand = "npm run build";
const runCommand = "npm run start";
const runCommand1 = runCommand.split(" ")[0];
const runCommand2 = runCommand.split(" ").slice(1);
console.log(runCommand1);
console.log(runCommand2);
let activeDir = 1;
let childNodeJsProcess = null;
const jsonString = fs.readFileSync("./iscreated.json", { encoding: "utf8" });
const isCreatedJson = JSON.parse(jsonString);
created = isCreatedJson.isCreated;
setInterval(() => {
  if (created == false) {
    const stdout1 = execSync(
      `mkdir app-1 && cd app-1 && git clone ${githubLINK} ./`
    );
    console.log(stdout1);
    const stdout2 = execSync(
      `mkdir app-2 && cd app-2 && git clone ${githubLINK} ./`
    );
    console.log(stdout2);
    const stdout3 = execSync(
      `cd app-1 && ${installCommand} && ${buildCommand}`
    );
    console.log(stdout3);
    const childNodeJsProcess3 = spawn(runCommand1, runCommand2, {
      detached: true,
      cwd: "app-1",
    });
    childNodeJsProcess3.stdout.on("data", (data) => {
      console.log(`stdout: ${data}`);
    });

    childNodeJsProcess3.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
    });

    childNodeJsProcess3.on("close", (code) => {
      console.log(`child process exited with code ${code}`);
    });
    childNodeJsProcess = childNodeJsProcess3;
    // console.log(stdout3);
    const jsonString = fs.readFileSync("./iscreated.json", {
      encoding: "utf8",
    });
    const isCreatedJson = JSON.parse(jsonString);
    isCreatedJson.isCreated = true;
    fs.writeFileSync("./iscreated.json", JSON.stringify(isCreatedJson), {
      encoding: "utf8",
    });
    created = true;
    return;
  }
  let stdout;
  if (activeDir == 1) {
    stdout = execSync(
      `cd app-1 && git fetch origin && git log origin/main --pretty=format:'{%n  "commit": "%H",%n  "author": "%aN <%aE>",%n  "date": "%ad",%n  "message": "%f"%n},'$@ |
      perl -pe 'BEGIN{print "["}; END{print "]\n"}' | perl -pe 's/},]/}]/'`
    );
  } else if (activeDir == 2) {
    stdout = execSync(
      `cd app-2 && git fetch origin && git log origin/main --pretty=format:'{%n  "commit": "%H",%n  "author": "%aN <%aE>",%n  "date": "%ad",%n  "message": "%f"%n},'$@ |
      perl -pe 'BEGIN{print "["}; END{print "]\n"}' | perl -pe 's/},]/}]/'`
    );
  }

  // get res  json
  const res = JSON.parse(stdout);
  const resArray1 = res.map((ele) => ele.commit);
  let n = resArray1.length;
  if (resArray.length == 0) {
    resArray = resArray1;
    n = 0;
  } else {
    for (let index = 0; index < resArray1.length; index++) {
      if (resArray.includes(resArray1[index])) {
        n = n - 1;
      }
    }
  }
  console.log(process.pid);
  if (n == 0) {
    console.log("Good");
    console.log(resArray);
  } else {
    console.log("Bad");
    resArray = resArray1;
    if (activeDir == 1) {
      const stdout1 = execSync(
        `cd app-2 && git pull origin main && ${installCommand} && ${buildCommand}`
      );
      console.log(stdout1);
      process.kill(-childNodeJsProcess.pid);
      const childNodeJsProcess1 = spawn(runCommand1, runCommand2, {
        detached: true,
        cwd: "app-2",
      });
      childNodeJsProcess1.stdout.on("data", (data) => {
        console.log(`stdout: ${data}`);
      });

      childNodeJsProcess1.stderr.on("data", (data) => {
        console.error(`stderr: ${data}`);
      });

      childNodeJsProcess1.on("close", (code) => {
        console.log(`child process exited with code ${code}`);
      });
      childNodeJsProcess = childNodeJsProcess1;
      activeDir = 2;
    } else if (activeDir == 2) {
      const stdout1 = execSync(
        `cd app-1 && git pull origin main && ${installCommand} && ${buildCommand}`
      );
      console.log(stdout1);
      process.kill(-childNodeJsProcess.pid);
      const childNodeJsProcess2 = spawn(runCommand1, runCommand2, {
        detached: true,
        cwd: "app-1",
      });
      childNodeJsProcess2.stdout.on("data", (data) => {
        console.log(`stdout: ${data}`);
      });

      childNodeJsProcess2.stderr.on("data", (data) => {
        console.error(`stderr: ${data}`);
      });

      childNodeJsProcess2.on("close", (code) => {
        console.log(`child process exited with code ${code}`);
      });
      childNodeJsProcess = childNodeJsProcess2;
      activeDir = 1;
    }
  }
}, 5000);
