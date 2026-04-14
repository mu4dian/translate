const { spawn } = require("node:child_process");

const apiKey = (process.env.QIANWEN_API_KEY || "").trim();

if (!apiKey) {
  console.error("缺少系统环境变量 QIANWEN_API_KEY，请先设置后再运行 npm run dev。");
  process.exit(1);
}

const cmd = `npx wrangler dev --var "QIANWEN_API_KEY:${apiKey}"`;
const child = spawn(cmd, {
  shell: true,
  stdio: "inherit",
  env: process.env,
});

child.on("exit", (code, signal) => {
  if (signal) process.kill(process.pid, signal);
  process.exit(code ?? 0);
});

